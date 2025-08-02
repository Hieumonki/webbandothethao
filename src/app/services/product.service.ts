import { Category } from './../models/category';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  url = `https://backend-funsport-6e9i.onrender.com/v1`;

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.url}/product`);
  }


  getProductDetail(id: string) {
    return this.httpClient.get(`${this.url}/product/${id}`);
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
