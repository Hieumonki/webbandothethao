import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Stats {
  totalRevenue: number;
  revenueGrowth: number;
  totalInventory: number;
  orderGrowth: number;
  percentageSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8000/v1/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi phía client: ${error.error.message}`;
    } else {
      errorMessage = `Lỗi phía server: ${error.status} - ${error.message}`;
      if (error.status === 0) {
        errorMessage = 'Không thể kết nối với server. Vui lòng kiểm tra server tại http://localhost:8000';
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
