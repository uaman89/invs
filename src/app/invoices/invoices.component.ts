import {Component, OnInit} from '@angular/core';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {

  public invoices: any[] = [];
  public customerList: any[] = [];
  public productList: any[] = [];

  public isModalReady = false;
  public newInvoice;
  public modalMsg = {
    isSuccess: false,
    text: '',
  };


  constructor(private api: ApiService) {

    this.resetNewInvoice();

    api.getInvoices().then(invoices => {
      this.invoices = invoices;
    });
  }

  private resetNewInvoice() {
    this.newInvoice = {
      customer: {
        name: '...loading'
      },
      products: new Set(),
      totalPrice: 0,
      discount: 0
    };
    this.modalMsg.text = null;
  }

  ngOnInit() {
  }

  showModal() {

    this.resetNewInvoice();

    Promise.all([
      this.api.getCustomers(),
      this.api.getProducts()
    ]).then(res => {
      this.customerList = res[0];
      this.newInvoice.customer = this.customerList[0];
      this.productList = res[1];

      this.isModalReady = true;
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
    this.productList[index].quantity = 1;
    this.newInvoice.products.add(this.productList[index]);
    this.updateInvoicePrice();
  }

  removeProductFromInvoice(product) {
    this.newInvoice.products.delete(product);
    this.updateInvoicePrice();
  }

  save() {
    this.api.createInvoice(this.newInvoice).then(
      (success:any[]) => {
        console.log(`success:`, success);
        this.modalMsg.isSuccess = true;
        this.modalMsg.text = `The Invoice #${success[0].invoiceId} has been created. It contains ${success.length-1} items.`;
      },
      fail => {
        console.log(`fail:`, fail);
        this.modalMsg.isSuccess = false;
        this.modalMsg.text = `Error: ${fail}`;
      }
    ).then( ()=> setTimeout(()=>this.modalMsg.text='', 3000));
  };
}
