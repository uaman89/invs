import { Component, OnInit } from '@angular/core';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {

  invoices: any[] = [];

  constructor( private api: ApiService) {

     api.getInvoices().then( invoices => {
       this.invoices = invoices;
     })
  }

  ngOnInit() {
  }

}
