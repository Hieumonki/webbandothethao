import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Product {
  _id: string;
  name: string;
  desc?: string;
  category: string;
  images: string[];
  price: number;
  color?: string;
  tab?: string;
  describe?: string;
  quantity: number;
  minStock: number;
  status?: 'instock' | 'lowstock' | 'outofstock';
  selected?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:8000/v1/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getProductStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  addProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteProducts(productIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk`, { productIds }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ProductsService error:', error);
    let errorMessage = 'Lỗi xử lý sản phẩm';
    if (error.status === 0) {
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra server backend.';
    } else if (error.status >= 500) {
      errorMessage = `Lỗi server: ${error.statusText || 'Lỗi không xác định'}`;
    } else if (error.status >= 400) {
      errorMessage = `Lỗi yêu cầu: ${error.statusText || 'Dữ liệu không hợp lệ'}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
