import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from "../../../models/product";
import { ProductSell } from "../../../models/productsell";
import { ProductService } from "../../../services/product.service";
import { ProductServiceSell } from "../../../services/productsell.service";
import { CartService } from '../../../services/cart.service';
import { FavoriteService } from '../../../services/favorite.service'; // ✅ Thêm service yêu thích

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterModule, FormsModule, CommonModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  column1: Product[] = [];
  column2: Product[] = [];
  column3: Product[] = [];
  productsell: ProductSell[] = [];

  selectedTab: string = 'all';

  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  private intervalId: any;

  constructor(
    private productService: ProductService,
    private productsellService: ProductServiceSell,
    private cartService: CartService,
    private favoriteService: FavoriteService
  ) { }

  ngOnInit(): void {
    this.productService.getAll().subscribe(data => {
      this.products = data;

      const chunkSize = Math.ceil(this.products.length / 3);
      this.column1 = this.products.slice(0, chunkSize);
      this.column2 = this.products.slice(chunkSize, chunkSize * 2);
      this.column3 = this.products.slice(chunkSize * 2);
    });

    this.productsellService.getAll().subscribe(data => {
      this.productsell = data;
    });

    this.startCountdown();
  }
  addToCart(product: Product): void {
  this.cartService.addToCart(product);
  alert(`✔️ Đã thêm "${product.name}" vào giỏ hàng!`);
}
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  get filteredProducts(): Product[] {
    if (this.selectedTab === 'all') return this.products;
    return this.products.filter(p => p.tab?.toLowerCase() === this.selectedTab);
  }

  get filteredProductSells(): ProductSell[] {
    return this.productsell;
  }

  private startCountdown(): void {
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 2);

    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate.getTime() - now;

      if (distance < 0) {
        this.days = this.hours = this.minutes = this.seconds = '00';
        clearInterval(this.intervalId);
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      this.days = String(d).padStart(2, '0');
      this.hours = String(h).padStart(2, '0');
      this.minutes = String(m).padStart(2, '0');
      this.seconds = String(s).padStart(2, '0');
    }, 1000);
  }

  toggleFavorite(product: Product): void {
    this.favoriteService.toggleFavorite(product);
  }

  isFavorite(product: Product): boolean {
    return this.favoriteService.isFavorite(product._id);
  }

  get favoriteCount(): number {
    return this.favoriteService.getCount();
  }
}
