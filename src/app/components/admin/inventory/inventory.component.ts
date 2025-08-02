import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { InventoryService, Product, Order } from '../services/inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css', ]
})
export class InventoryComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  orders: Order[] = [];
  recentOrders: Order[] = [];
  filteredOrders: Order[] = [];
  totalProducts: number = 0;
  totalValue: number = 0;
  ordersToday: number = 0;
  outOfStock: number = 0;
  newProduct: Product = { _id: '', productName: '', category: '', quantity: 0, price: 0, minStock: 0 };
  updateProductId: string = '';
  updateType: 'add' | 'remove' | 'set' = 'add';
  updateQuantity: number = 0;
  isOrdersModalOpen: boolean = false;
  errorMessage: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    this.subscriptions.add(
      this.inventoryService.getProducts().subscribe({
        next: (products: Product[]) => {
          this.products = products;
          this.totalProducts = products.length;
          this.totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
          this.outOfStock = products.filter(p => p.quantity <= 0).length;
          this.errorMessage = '';
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi tải sản phẩm: ' + err.message;
        }
      })
    );
    this.subscriptions.add(
      this.inventoryService.getOrders().subscribe({
        next: (orders: Order[]) => {
          this.orders = orders;
          this.recentOrders = orders.slice(0, 10);
          this.filteredOrders = orders;
          const today = new Date().toISOString().split('T')[0];
          this.ordersToday = orders.filter(o => o.createdAt?.startsWith(today)).length;
          this.errorMessage = '';
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi tải đơn hàng: ' + err.message;
        }
      })
    );
  }

  addProduct(): void {
    if (!this.newProduct.productName || !this.newProduct.category || this.newProduct.quantity < 0 || this.newProduct.price < 0 || this.newProduct.minStock < 0) {
      this.errorMessage = 'Vui lòng nhập đầy đủ và hợp lệ các trường.';
      return;
    }
    this.subscriptions.add(
      this.inventoryService.addProduct(this.newProduct).subscribe({
        next: (product: Product) => {
          this.products.push(product);
          this.totalProducts = this.products.length;
          this.totalValue = this.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
          this.outOfStock = this.products.filter(p => p.quantity <= 0).length;
          this.newProduct = { _id: '', productName: '', category: '', quantity: 0, price: 0, minStock: 0 };
          this.errorMessage = '';
          alert('Sản phẩm đã được thêm thành công!');
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi thêm sản phẩm: ' + err.message;
        }
      })
    );
  }

  updateInventory(): void {
    if (!this.updateProductId || this.updateQuantity < 0) {
      this.errorMessage = 'Vui lòng chọn sản phẩm và nhập số lượng hợp lệ.';
      return;
    }
    const product = this.products.find(p => p._id === this.updateProductId);
    if (!product) {
      this.errorMessage = 'Sản phẩm không tồn tại.';
      return;
    }
    let newQuantity: number;
    if (this.updateType === 'add') {
      newQuantity = product.quantity + this.updateQuantity;
    } else if (this.updateType === 'remove') {
      newQuantity = Math.max(0, product.quantity - this.updateQuantity);
    } else {
      newQuantity = this.updateQuantity;
    }
    this.subscriptions.add(
      this.inventoryService.updateProduct(this.updateProductId, { ...product, quantity: newQuantity }).subscribe({
        next: (updatedProduct: Product) => {
          this.products = this.products.map(p => p._id === updatedProduct._id ? updatedProduct : p);
          this.totalValue = this.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
          this.outOfStock = this.products.filter(p => p.quantity <= 0).length;
          this.updateProductId = '';
          this.updateType = 'add';
          this.updateQuantity = 0;
          this.errorMessage = '';
          alert('Cập nhật tồn kho thành công!');
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi cập nhật tồn kho: ' + err.message;
        }
      })
    );
  }

  openModal(event: Event): void {
    event.preventDefault();
    this.isOrdersModalOpen = true;
    this.filteredOrders = this.orders;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isOrdersModalOpen = false;
    this.filteredOrders = this.orders;
    document.body.style.overflow = 'auto';
  }

  deleteOrder(orderId: string): void {
    if (confirm(`Bạn có chắc muốn xóa đơn hàng ${orderId}?`)) {
      this.subscriptions.add(
        this.inventoryService.deleteOrder(orderId).subscribe({
          next: () => {
            this.loadData();
            this.errorMessage = '';
            alert('Xóa đơn hàng thành công!');
          },
          error: (err: HttpErrorResponse) => {
            this.errorMessage = 'Lỗi xóa đơn hàng: ' + err.message;
          }
        })
      );
    }
  }

  editOrder(order: Order): void {
    alert(`Chỉnh sửa đơn hàng ${order.orderId}:\nTên: ${order.productName}\nGiá: ${order.price}\nThanh toán: ${order.payment}\nTrạng thái: ${order.status === 'inprogress' ? 'Hết hàng' : order.status === 'delivered' ? 'Sắp hết hàng' : 'Còn hàng'}`);
    // Implement edit logic if needed (e.g., open a form)
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }

  trackByOrderId(index: number, order: Order): string {
    return order._id;
  }
}
