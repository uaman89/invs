import {Component, OnInit} from '@angular/core';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {

  public invoices: any[] = [];
  public customerList:any[] = [];

  public isModalReady = false;
  public newInvoice = {
    customer: {
      name: 'unknown'
    }
  };


  constructor(private api: ApiService) {

    api.getInvoices().then(invoices => {
      this.invoices = invoices;
    });
  }

  ngOnInit() {
  }

  showModal() {
    this.api.getCustomers().then(customers => {
      this.customerList = customers;
      this.newInvoice.customer = this.customerList[0];
      this.isModalReady = true;
    });

  }

  closeModal(){
    this.newInvoice = {
      customer: {
        name: '...loading'
      }
    }
  }
}
