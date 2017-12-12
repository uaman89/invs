import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class ApiService {

  // private baseUrl = 'http://localhost:8000/api/';
  private baseUrl = '/api/';

  constructor(private http: HttpClient) {
  }

  public getInvoices(): Promise<any[]> {

    const url = `${this.baseUrl}invoices/`;

    return this.http.get(url).toPromise().then(
      res => res,
      error => {
        console.error('at getInvoices:', error);
        return Error(`can't load invoices`);
      }
    );

  }

  getCustomers(): Promise<any[]> {
    const url = `${this.baseUrl}customers/`;

    return this.http.get(url).toPromise().then(
      res => res,
      error => {
        console.error('at getCustomers:', error);
        return Error(`can't load customers`);
      }
    );
  }

  // todo: reduce copy-paste?
  getProducts(): Promise<any[]> {
    const url = `${this.baseUrl}products/`;

    return this.http.get(url).toPromise().then(
      res => res,
      error => {
        console.error('at getCustomers:', error);
        return Error(`can't load customers`);
      }
    );
  }

  createInvoice(invoice) {
    let url = `${this.baseUrl}invoices/`;
    const promises = [];

    return this.http.post(url, {
      customer_id: invoice.customer.id,
      discount: invoice.discount,
      total: invoice.totalPrice
    }).toPromise().then(res => {
      console.log(`res:`, res);
      if (res['id']) {
        const invoiceId = res['id'];
        promises.push({invoiceId});

        url += `${invoiceId}/items`;

        invoice.products.forEach(product => {

          promises.push(
            this.http.post(url, {
              invoice_id: invoiceId,
              product_id: product.id,
              quantity: product.quantity
            })
          );

        });

      }
      return Promise.all(promises);
    }, error => {
      console.error('at getCustomers:', error);
      return Error(`can't load customers`);
    })
  }


}
