import {Component, OnInit} from '@angular/core';
import {ApiService} from '../services/api.service';
import {Subject} from 'rxjs/Subject';
import {debounceTime} from 'rxjs/operators';

declare const $;

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {

  public invoices: any[] = [];
  public customerList: any[] = [];
  public productList: any[] = [];

  public newInvoice: {
    id?: number,
    customer: {
      id?: number,
      name: string;
    };
    products: Set<any>;
    totalPrice: number;
    discount: number
  };

  public modal = {
    title: 'Invoice',
    isModalReady: false,
    msg: {
      isSuccess: false,
      text: '',
    }
  };

  public silentInvoiceSave = new Subject();
  public silentItemSave = new Subject();

  constructor(private api: ApiService) {
    this.resetNewInvoice();
    this.updateExistInvoices();
  }

  ngOnInit() {

    this.silentInvoiceSave.pipe(
      debounceTime(300),
    ).subscribe(() => this.saveInvoice());


    this.silentItemSave.pipe(
      debounceTime(300),
    ).subscribe((invoice) => this.saveInvoiceItem(invoice));

  }

  updateExistInvoices() {

    Promise.all([
      this.api.getInvoices(),
      this.api.getCustomers()
    ])
      .then(res => {
        this.invoices = res[0];

        let customers = res[1];
        this.invoices.forEach(invoice => {
          invoice.__customerData = customers.find((c => c.id === invoice['customer_id']));
        });
      });
  }

  private resetNewInvoice() {
    this.newInvoice = {
      id: null,
      customer: {
        name: '...loading'
      },
      products: new Set(),
      totalPrice: 0,
      discount: null
    };
    this.modal.msg.text = null;
  }

  showModal() {

    this.resetNewInvoice();
    this.modal.title = "Add Invoice";

    return Promise.all([
      this.api.getCustomers(),
      this.api.getProducts()
    ]).then(res => {
      this.customerList = res[0];
      this.newInvoice.customer = this.customerList[0];
      this.productList = res[1];
      this.modal.isModalReady = true;
    });

  }

  updateInvoicePrice() {
    this.newInvoice.totalPrice = 0;
    this.newInvoice.products.forEach(product => {
      this.newInvoice.totalPrice += product.price * product.quantity;
    });
    if (this.newInvoice.discount > 0) {
      this.newInvoice.totalPrice -= this.newInvoice.totalPrice * this.newInvoice.discount / 100;
    }
  }

  addProductToInvoice(index) {
    if (this.productList[index] && this.productList[index].id) {
      this.productList[index].quantity = 1;
      this.newInvoice.products.add(this.productList[index]);
      this.updateInvoicePrice();
    }
  }

  removeProductFromInvoiceForm(product) {
    if (product.__invoiceItemId) {
      this.api.deleteInvoiceItem(this.newInvoice.id, product.__invoiceItemId).then(() => {
        this.newInvoice.products.delete(product);
      });
    } else {
      this.newInvoice.products.delete(product);
    }
  }

  save() {
    console.dir('save():');

    let result: Promise<any>;

    if (!this.newInvoice.id) {
      result = this.api.createInvoice(this.newInvoice);
    } else {
      result = this.api.updateInvoice(this.newInvoice);
    }

    result.then((invoice) => {
      return this.api.saveInvoiceItems(invoice['id'], this.newInvoice.products);
    })
      .then(
        (success: any[]) => {
          console.log(`success:`, success);
          this.modal.msg.isSuccess = true;
          this.modal.msg.text = `The Invoice #${success[0].invoiceId} has been saved. It contains ${success.length - 1} items.`;

          setTimeout(() => this.modal.msg.text = '', 3000);
          this.updateExistInvoices();
        },
        fail => {
          console.log(`fail:`, fail);
          this.modal.msg.isSuccess = false;
          this.modal.msg.text = `Error: ${fail}`;
        }
      );
  }

  saveInvoice() {
    if (this.newInvoice.id) {
      this.api.updateInvoice(this.newInvoice).then(
        (success: any) => {
          console.log(`success:`, success);
          this.modal.msg.isSuccess = true;
          this.modal.msg.text = `The Invoice #${success.id} has been saved.`;

          setTimeout(() => this.modal.msg.text = '', 3000);
          this.updateExistInvoices();
        },
        fail => {
          console.log(`fail:`, fail);
          this.modal.msg.isSuccess = false;
          this.modal.msg.text = `Error: ${fail}`;
        }
      );
    }
  }

  saveInvoiceItem(item) {

    if (this.newInvoice.id) {
      console.log('silentSave:');
      this.api.saveInvoiceItems(this.newInvoice.id, new Set([item])).then(
        (success: any) => {
          console.log(`success:`, success);
          this.modal.msg.isSuccess = true;
          this.modal.msg.text = `The Invoice item has been saved. Quantity: ${success[1].quantity}`;

          setTimeout(() => this.modal.msg.text = '', 3000);
          this.updateExistInvoices();
        },
        fail => {
          console.log(`fail:`, fail);
          this.modal.msg.isSuccess = false;
          this.modal.msg.text = `Error: ${fail}`;
        }
      );
    }
  }

  editInvoice(invoice) {
    console.log('invoice:', invoice);

    if (!invoice.id) {
      return Error('if not provided');
    }

    this.showModal().then(() => {

        this.newInvoice.id = invoice.id;
        this.newInvoice.discount = invoice.discount;
        this.newInvoice.customer = this.customerList.find(c => c.id === invoice.customer_id);

        return this.api.getInvoiceItems(invoice.id).then(items => {
          console.log('items:', items);
          items.forEach(item => {
            let product = this.productList.find(p => p.id === item['product_id']);
            product.quantity = item['quantity'];
            product.__invoiceItemId = item.id;
            this.newInvoice.products.add(product);
          });
        }).then(() => {
          return this.updateInvoicePrice();
        });

      },
      error => alert('unexpected error')
    ).then(() => {
      this.modal.title = "Edit Invoice";
      $('#myModal').modal('show');
    });

  }

  delInvoice(invoice) {
    this.api.deleteInvoice(invoice.id).then(
      res => {
        console.log('res:', res);
        this.updateExistInvoices();
      },
      error => alert('error: can`t delete invoice')
    );
  }

}
