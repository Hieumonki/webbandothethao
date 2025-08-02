import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/cart-item.model';
import { Product } from '../../../models/product';
import { CommonModule, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule, NgIf, NgForOf, DecimalPipe]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
    console.log('🛒 Cart:', this.cartItems); // ✅ Debug kiểm tra
  }

  removeItem(productId: string): void {
    this.cartService.removeOne(productId);
    this.cartItems = this.cartService.getItems();
  }

  removeAll(productId: string): void {
    this.cartService.removeAllById(productId);
    this.cartItems = this.cartService.getItems();
  }

 increase(product: Product): void {
  this.cartService.addToCart({
    ...product,
    selectedSize: product.selectedSize,
    selectedColor: product.selectedColor,
    quantity: 1
  });
  this.cartItems = this.cartService.getItems();
}




  decrease(productId: string): void {
    this.removeItem(productId);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  checkout(): void {
    const total = this.getTotal();

    if (total === 0) {
      alert('❌ Giỏ hàng trống!');
      return;
    }

    const body = {
      amount: total,
      redirectUrl: 'http://localhost:4200/thank-you'
    };

    this.http.post<any>('http://localhost:8000/payment', body).subscribe(
      res => {
        if (res && res.payUrl) {
          window.location.href = res.payUrl;
        } else {
          alert('❌ Không lấy được link thanh toán MoMo.');
        }
      },
      err => {
        console.error(err);
        alert('❌ Lỗi khi tạo thanh toán.');
      }
    );
  }
}
