
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { ProductSell } from '../models/productsell';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceSell {
  url = `https://backend-funsport-6e9i.onrender.com/v1`;

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<ProductSell[]> {
    return this.httpClient.get<ProductSell[]>(`${this.url}/productsell`);
  }


  getProductDetail(id: string) {
    return this.httpClient.get(`${this.url}/productsell/${id}`);
  }

  getProductByQuery(params: any) {
    console.log(params);
    const queryParts: string[] = [];

    if (params.category) {
      queryParts.push(`category=${params.category}`);
    }

    if (params.keyword) {
      queryParts.push(`keyword=${params.keyword}`);
    }

    const query = queryParts.join('&');
    return this.httpClient.get(`${this.url}/product?${query}`);
  }

}
