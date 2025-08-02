import { Component, OnInit } from '@angular/core';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { CartService } from '../../../services/cart.service';
import { Category } from '../../../models/category';
import { FormsModule } from '@angular/forms';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  imports: [RouterModule, CommonModule, FormsModule]
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  originalProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = '';
  selectedPrice: string = '';
  pageSize: number = 8;
  currentPage: number = 1;
  totalPagesArray: number[] = [];
  favoriteProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private cartService: CartService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    this.favoriteService.favorites$.subscribe(data => {
      this.favoriteProducts = data;
    });
  }

  loadProducts(): void {
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'];
      const category = params['category'];

      const fetchProducts = keyword || category
        ? this.productService.getProductByQuery({ keyword, category })
        : this.productService.getAll();

      fetchProducts.subscribe(data => {
        this.originalProducts = data as Product[];
        this.applyFilterAndPagination();
      });
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    });
  }

  filterProducts(): void {
    this.applyFilterAndPagination();
  }

  applyFilterAndPagination(): void {
    let filtered = [...this.originalProducts];

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedPrice) {
      const [min, max] = this.selectedPrice.split('-').map(Number);
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    this.products = filtered;
    const totalPages = Math.ceil(this.products.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    alert(`✔️ Đã thêm "${product.name}" vào giỏ hàng!`);
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
