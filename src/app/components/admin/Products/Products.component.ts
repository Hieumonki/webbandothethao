import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product, ProductStats } from '../services/Products.service';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Products.component.html',
  styleUrls: ['./Products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productStats: ProductStats = { totalProducts: 0, inStockProducts: 0, lowStockProducts: 0, outOfStockProducts: 0 };
  isLoadingProducts = true;
  isLoadingStats = true;
  errorProducts: string | null = null;
  errorStats: string | null = null;
  isAddModalOpen = false;
  isEditModalOpen = false;
  selectAll = false;
  hasSelectedProducts = false;
  searchQuery = '';
  categoryFilter = 'all';
  statusFilter = 'all';
  currentPage = 1;
  pageSize = 10;
  newProduct: Partial<Product> & { images: string[] } = this.resetNewProduct();
  editProduct: Product | null = null;
  categories = ['all', 'badminton', 'football', 'volleyball', 'billiards', 'electronics', 'sports', 'clothing', 'food', 'books'];
  private subscriptions: Subscription = new Subscription();

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    this.isLoadingProducts = true;
    this.isLoadingStats = true;
    this.errorProducts = null;
    this.errorStats = null;
    this.subscriptions.add(
      forkJoin({
        products: this.productsService.getProducts(),
        stats: this.productsService.getProductStats()
      }).subscribe({
        next: ({ products, stats }) => {
          console.log('Raw products response:', products);
          console.log('Raw product stats response:', stats);
          this.products = products.map(product => ({ ...product, selected: false })) || [];
          this.productStats = stats;
          this.isLoadingProducts = false;
          this.isLoadingStats = false;
          this.applyFilters();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading data:', err);
          let errorMessage = 'Lỗi khi tải danh sách sản phẩm';
          if (err.status === 0) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra server backend tại http://localhost:8000/v1/products.';
          } else if (err.status >= 500) {
            errorMessage = `Lỗi server: ${err.statusText || 'Lỗi không xác định'}.`;
          } else if (err.status >= 400) {
            errorMessage = `Lỗi yêu cầu: ${err.statusText || 'Dữ liệu không hợp lệ'}.`;
          }
          this.errorProducts = errorMessage;
          this.errorStats = 'Lỗi khi tải thống kê';
          this.isLoadingProducts = false;
          this.isLoadingStats = false;
          this.filteredProducts = [];
        }
      })
    );
  }

  resetNewProduct(): Partial<Product> & { images: string[] } {
    return {
      name: '',
      quantity: 0,
      category: 'badminton',
      price: 0,
      images: [''],
      desc: '',
      color: '',
      tab: '',
      describe: '',
      minStock: 5
    };
  }

  openAddModal(): void {
    this.newProduct = this.resetNewProduct();
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  openEditModal(product: Product): void {
    this.editProduct = { ...product, images: product.images || [''] };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editProduct = null;
  }

  addProduct(): void {
    if (!this.newProduct.name || !this.newProduct.price || this.newProduct.quantity === undefined) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm!');
      return;
    }
    this.subscriptions.add(
      this.productsService.addProduct(this.newProduct).subscribe({
        next: (product) => {
          this.products.push(product);
          this.applyFilters();
          this.closeAddModal();
          alert('Thêm sản phẩm thành công!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error adding product:', err);
          alert('Lỗi khi thêm sản phẩm: ' + (err.statusText || 'Lỗi không xác định'));
        }
      })
    );
  }

  updateProduct(): void {
    if (!this.editProduct || !this.editProduct.name || !this.editProduct.price || this.editProduct.quantity === undefined) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm!');
      return;
    }
    this.subscriptions.add(
      this.productsService.updateProduct(this.editProduct._id, this.editProduct).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex(p => p._id === updatedProduct._id);
          if (index !== -1) {
            this.products[index] = { ...updatedProduct, selected: this.products[index].selected };
            this.applyFilters();
          }
          this.closeEditModal();
          alert('Cập nhật sản phẩm thành công!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error updating product:', err);
          alert('Lỗi khi cập nhật sản phẩm: ' + (err.statusText || 'Lỗi không xác định'));
        }
      })
    );
  }

  deleteProduct(product: Product): void {
    if (confirm(`Bạn có chắc muốn xóa sản phẩm ${product.name}?`)) {
      this.subscriptions.add(
        this.productsService.deleteProduct(product._id).subscribe({
          next: () => {
            this.products = this.products.filter(p => p._id !== product._id);
            this.applyFilters();
            alert('Xóa sản phẩm thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error deleting product:', err);
            alert('Lỗi khi xóa sản phẩm: ' + (err.statusText || 'Lỗi không xác định'));
          }
        })
      );
    }
  }

  deleteSelectedProducts(): void {
    const selectedProducts = this.filteredProducts.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn sản phẩm để xóa.');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`)) {
      this.subscriptions.add(
        this.productsService.deleteProducts(selectedProducts.map(p => p._id)).subscribe({
          next: () => {
            this.products = this.products.filter(p => !p.selected);
            this.hasSelectedProducts = false;
            this.selectAll = false;
            this.applyFilters();
            alert('Xóa sản phẩm thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error deleting products:', err);
            alert('Lỗi khi xóa sản phẩm: ' + (err.statusText || 'Lỗi không xác định'));
          }
        })
      );
    }
  }

  viewProductDetails(product: Product): void {
    alert(`Chi tiết sản phẩm:
Tên: ${product.name}
Số Lượng: ${product.quantity}
Danh Mục: ${product.category}
Giá: ${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
Trạng Thái: ${this.translateProductStatus(product.status)}
Mô Tả: ${product.desc || 'N/A'}
Hình Ảnh: ${product.images[0] || 'N/A'}
Màu Sắc: ${product.color || 'N/A'}
Tab: ${product.tab || 'N/A'}
Mô Tả Chi Tiết: ${product.describe || 'N/A'}
Số Lượng Tối Thiểu: ${product.minStock}`);
  }

  toggleSelectAll(): void {
    this.filteredProducts.forEach(product => product.selected = this.selectAll);
    this.updateSelectedProducts();
  }

  updateSelectedProducts(): void {
    this.hasSelectedProducts = this.filteredProducts.some(p => p.selected);
    this.selectAll = this.filteredProducts.every(p => p.selected);
  }

  applyFilters(): void {
    let filtered = [...this.products];
    if (this.searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === this.categoryFilter);
    }
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }
    this.filteredProducts = filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    this.updateSelectedProducts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.products.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.pageSize);
  }

  exportProducts(): void {
    const headers = ['Tên', 'Số Lượng', 'Danh Mục', 'Giá', 'Trạng Thái', 'Mô Tả', 'Màu Sắc', 'Tab', 'Mô Tả Chi Tiết', 'Số Lượng Tối Thiểu'];
    const rows = this.products.map(product => [
      product.name,
      product.quantity,
      product.category,
      product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      this.translateProductStatus(product.status),
      product.desc || 'N/A',
      product.color || 'N/A',
      product.tab || 'N/A',
      product.describe || 'N/A',
      product.minStock
    ].map(field => `"${field}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Xuất dữ liệu sản phẩm thành công!');
  }

  openSettings(): void {
    alert('Chức năng cài đặt đang được phát triển!');
  }

  translateProductStatus(status: string | undefined): string {
    switch (status) {
      case 'instock': return 'Còn hàng';
      case 'lowstock': return 'Sắp hết';
      case 'outofstock': return 'Hết hàng';
      default: return 'Còn hàng';
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
