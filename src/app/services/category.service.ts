import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  url = `https://backend-funsport-6e9i.onrender.com/v1`;

  constructor(private httpClient: HttpClient) { }

  // Phương thức lấy tất cả danh mục
  getAll() {
    return this.httpClient.get(`${this.url}/category`);
  }
  delete(id: string) {
    return this.httpClient.delete(`${this.url}/category/${id}`);
  }

  addCategory(body: any) {
    return this.httpClient.post(`${this.url}/category`, body);
  }

  updateCategory(body:any, id: string) {
    return this.httpClient.put(`${this.url}/category/${id}`, body);
  }

  getCtegoryDetail(id: string) {
    return this.httpClient.get(`${this.url}/category/${id}`);
}
}
