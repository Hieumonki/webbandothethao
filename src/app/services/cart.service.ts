import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
    this.updateCartCount();
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
  }

  private updateCartCount(): void {
    const totalQuantity = this.cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    this.cartCount.next(totalQuantity);
  }

  getItems(): CartItem[] {
    return this.cart;
  }

  addToCart(item: any): void {
    const existingIndex = this.cart.findIndex(i =>
      i.product._id === item._id &&
      i.selectedSize === item.selectedSize &&
      i.selectedColor === item.selectedColor
    );

    const quantity = Number(item.quantity) || 1;

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        product: item,
        quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      });
    }

    this.saveCart();
  }

  removeOne(productId: string): void {
    const index = this.cart.findIndex(item => item.product._id === productId);
    if (index !== -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
      this.saveCart();
    }
  }

  removeAllById(productId: string): void {
    this.cart = this.cart.filter(item => item.product._id !== productId);
    this.saveCart();
  }

  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
