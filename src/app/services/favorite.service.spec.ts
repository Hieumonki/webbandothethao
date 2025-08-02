import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoriteProducts: Product[] = [];
  private favoriteCountSubject = new BehaviorSubject<number>(0);

  favoriteCount$ = this.favoriteCountSubject.asObservable(); // cho Header subscribe

  constructor() {}

  toggleFavorite(product: Product): void {
    const index = this.favoriteProducts.findIndex(p => p._id === product._id);
    if (index > -1) {
      this.favoriteProducts.splice(index, 1); // Bỏ yêu thích
    } else {
      this.favoriteProducts.push(product); // Thêm yêu thích
    }
    this.favoriteCountSubject.next(this.favoriteProducts.length);
  }

  getFavorites(): Product[] {
    return this.favoriteProducts;
  }
}
