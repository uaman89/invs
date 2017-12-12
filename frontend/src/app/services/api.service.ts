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

  public getInvoice(id: number): Promise<any[]> {

    if (!id) {
      throw Error('invoice id required!');
    }

    const url = `${this.baseUrl}invoices/${id}`;

    return this.http.get(url).toPromise().then(
      res => res,
      error => {
        console.error('at getInvoices:', error);
        return Error(`can't load invoices`);
      }
    );

  }

  public getInvoiceItems(invoiceId): Promise<any[]> {
    if (!invoiceId && typeof invoiceId !== 'number') {
      console.error('at getInvoiceItems(): no id provided!');
      return Promise.reject('no id provided');
    }

    const url = `${this.baseUrl}invoices/${invoiceId}/items`;
    return this.http.get(url).toPromise();
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

  /*addInvoiceItems(invoiceId, items: Set<any>) {
    const promises = [];
    if (invoiceId && typeof invoiceId === 'number') {
      promises.push({invoiceId});

      const url = `${this.baseUrl}invoices/${invoiceId}/items`;

      items.forEach(product => {

        promises.push(
          this.http.post(url, {
            invoice_id: invoiceId,
            product_id: product.id,
            quantity: product.quantity
          }).toPromise()
        );

      });

    }
    return Promise.all(promises);
  }
*/

  saveInvoiceItems(invoiceId, items: Set<any>) {
    const promises = [];
    if (invoiceId && typeof invoiceId === 'number') {
      promises.push({invoiceId});

      const url = `${this.baseUrl}invoices/${invoiceId}/items`;

      items.forEach(item => {

        let body = {
          invoice_id: invoiceId,
          product_id: item.id,
          quantity: item.quantity
        };

        if (item.__saved) {
          // update saved

          let itemUrl = `${url}/${item.id}`;
          promises.push(
            this.http.put(itemUrl, body).toPromise()
          );
        } else {
          // create new one
          promises.push(
            this.http.post(url, body).toPromise()
          );
        }
      });

    }
    return Promise.all(promises);
  }

  createInvoice(invoice) {
    let url = `${this.baseUrl}invoices/`;

    return this.http.post(url, {
      customer_id: invoice.customer.id,
      discount: invoice.discount,
      total: invoice.totalPrice
    }).toPromise().then(res => {
      console.log(`res:`, res);
      return res;

    }, error => {
      alert(`can't create invoice`);
      return Error('at createInvoice:' + error);
    });
  }

  updateInvoice(invoice) {

    //check id...

    let url = `${this.baseUrl}invoices/${invoice.id}`;

    return this.http.put(url, {
      customer_id: invoice.customer.id,
      discount: invoice.discount,
      total: invoice.totalPrice
    }).toPromise().then(res => {
      console.log(`res:`, res);
      return res;

    }, error => {
      alert(`can't update invoice`);
      return Error('at updateInvoice:' + error);
    });
  }

  deleteInvoice(invoiceId) {
    let url = `${this.baseUrl}invoices/${invoiceId}`;
    return this.http.delete(url).toPromise();
  }


}
