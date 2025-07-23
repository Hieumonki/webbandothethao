import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  id!: string;
  relatedProducts: Product[] = [];

  selectedSize: string = '';
  selectedColor: string = '';

  sizes: string[] = [];   // ✅ Kích thước từ MongoDB
  colors: string[] = [];  // ✅ Màu sắc từ MongoDB

  quantity: number = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id') || '';
      if (this.id) {
        this.loadProductDetail(this.id);
      }
    });
  }

  loadProductDetail(id: string): void {
    this.productService.getProductDetail(id).subscribe(data => {
      this.product = data as Product;

      // ✅ Parse màu sắc
      try {
        this.colors = Array.isArray(this.product.color)
          ? this.product.color
          : JSON.parse(this.product.color);
      } catch (err) {
        console.warn('⚠ Không parse được màu:', err);
        this.colors = [];
      }

      // ✅ Parse kích thước
      try {
        this.sizes = Array.isArray(this.product.size)
          ? this.product.size
          : JSON.parse(this.product.size);
      } catch (err) {
        console.warn('⚠ Không parse được size:', err);
        this.sizes = [];
      }



      this.getRelatedProducts();
    });
  }

  addToCart(product: Product): void {
    if (!this.selectedColor || !this.selectedSize) {
      alert('⚠️ Vui lòng chọn màu và kích cỡ trước khi thêm vào giỏ.');
      return;
    }

    const productWithOptions = {
      ...product,
      selectedSize: this.selectedSize,
      selectedColor: this.selectedColor,
      quantity: this.quantity
    };

    this.cartService.addToCart(productWithOptions);
    alert(`✔️ Đã thêm "${product.name}" (Size: ${this.selectedSize}, Màu: ${this.selectedColor}) vào giỏ hàng!`);
  }

  muaNgay(product: Product): void {
    if (!product.price || isNaN(+product.price)) {
      alert('❌ Sản phẩm chưa có giá. Không thể thanh toán.');
      return;
    }

    const body = {
      amount: product.price,
      redirectUrl: 'http://localhost:4200/thank-you'
    };

    this.http.post<any>('http://localhost:8000/payment', body).subscribe(
      res => {
        if (res?.payUrl) {
          window.location.href = res.payUrl;
        } else {
          alert('❌ Không lấy được link thanh toán MoMo.');
        }
      },
      err => {
        console.error(err);
        alert('❌ Có lỗi xảy ra khi tạo thanh toán.');
      }
    );
  }

  getRelatedProducts(): void {
    if (!this.product?.category) return;

    const url = `http://localhost:8000/v1/product/random/products?limit=4&exclude=${this.product._id}&category=${this.product.category}`;

    this.http.get<Product[]>(url).subscribe(
      data => {
        this.relatedProducts = data.filter(p => p._id !== this.product._id);
      },
      err => {
        console.error('Không lấy được sản phẩm gợi ý:', err);
      }
    );
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }
}
