import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from './users.service';

export interface Product {
  _id: string;
  name: string;
  desc: string;
  category: string;
  images: string[];
  price: number;
  color: string;
  tab: string;
  describe: string;
  quantity: number;
  minStock: number;
  status: 'active' | 'locked';
}

export interface Order {
  _id?: string;
  orderId: string;
  productId: Product;
  userId: User;
  totalAmount: number;
  payment: string;
  status: string;
  createdAt: string;
  category: string;
  selected?: boolean;
}

export interface RevenueData {
  totalRevenue: number;
  revenueByCategory: { categoryName: string; totalRevenue: number; totalOrders: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8000/v1/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(this.handleError)
    );
  }

  addOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order).pipe(
      catchError(this.handleError)
    );
  }

  updateOrder(orderId: string, order: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}`, order).pipe(
      catchError(this.handleError)
    );
  }

  deleteOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteOrders(orderIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, { orderIds }).pipe(
      catchError(this.handleError)
    );
  }

  toggleOrderLock(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/toggle-lock/${orderId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getRevenue(startDate?: string, endDate?: string): Observable<RevenueData> {
    let url = `${this.apiUrl}/revenue`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.http.get<RevenueData>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('OrderService: Error:', error.message);
    return throwError(() => new Error('Lỗi khi xử lý yêu cầu đơn hàng'));
  }
}
