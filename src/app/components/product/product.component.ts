import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { Category } from '../../models/category';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  imports: [RouterModule, CommonModule,FormsModule]
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  originalProducts: Product[] = [];
  categories: Category[] = [];

  selectedCategory: string = '';
  selectedPrice: string = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'];
      const category = params['category'];

      if (keyword || category) {
        this.productService.getProductByQuery({ keyword, category }).subscribe(data => {
          this.originalProducts = data as Product[];
          this.products = [...this.originalProducts];
        });
      } else {
        this.productService.getAll().subscribe(data => {
          this.originalProducts = data as Product[];
          this.products = [...this.originalProducts];
        });
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    });
  }

  filterProducts(): void {
    let filtered = [...this.originalProducts];

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedPrice) {
      const [min, max] = this.selectedPrice.split('-').map(Number);
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    this.products = filtered;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    alert(`✔️ Đã thêm "${product.name}" vào giỏ hàng!`);
  }
}
