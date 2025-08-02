import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoriteList: Product[] = [];
  private favoriteSubject = new BehaviorSubject<Product[]>([]);

  get favorites$() {
    return this.favoriteSubject.asObservable();
  }

  getFavoriteList(): Product[] {
    return this.favoriteList;
  }

  addFavorite(product: Product): void {
    if (!this.favoriteList.find(p => p._id === product._id)) {
      this.favoriteList.push(product);
      this.favoriteSubject.next(this.favoriteList);
    }
  }

  removeFavorite(productId: string): void {
    this.favoriteList = this.favoriteList.filter(p => p._id !== productId);
    this.favoriteSubject.next(this.favoriteList);
  }

  toggleFavorite(product: Product): void {
    const exists = this.favoriteList.find(p => p._id === product._id);
    if (exists) {
      this.removeFavorite(product._id);
    } else {
      this.addFavorite(product);
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteList.some(p => p._id === productId);
  }

  getCount(): number {
    return this.favoriteList.length;
  }
}
