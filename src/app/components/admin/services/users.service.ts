import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from './orders.service';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'locked' | 'pending';
  orderCount?: number;
  returnCount?: number;
  phone?: string;
  address?: string;
  spamCount: number;
  cancellationCount: number;
  ghostingCount: number;
  products?: Product[];
  lockReason?: string | null;
  selected?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  pendingUsers: number;
  totalViolations: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8000/v1/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  toggleLockUser(userId: string, lockReason: string | null): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/toggle-lock/${userId}`, { lockReason }).pipe(
      catchError(this.handleError)
    );
  }

  toggleProductLock(userId: string, productId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/toggle-product-lock/${userId}`, { productId }).pipe(
      catchError(this.handleError)
    );
  }

  reportViolation(userId: string, violationType: 'spam' | 'cancellation' | 'ghosting'): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/report-violation/${userId}`, { violationType }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteUsers(userIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk`, { userIds }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('UsersService: Error:', error.message);
    return throwError(() => new Error('Lỗi khi xử lý yêu cầu người dùng'));
  }
}
