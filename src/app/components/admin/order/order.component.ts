import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order, Product } from '../services/orders.service';
import { UsersService, User } from '../services/users.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  startDate: string = '';
  endDate: string = '';
  isSelectAll: boolean = false;
  totalOrders: number = 0;
  inProgressOrders: number = 0;
  deliveredOrders: number = 0;
  returnOrders: number = 0;
  errorMessage: string | null = null;
  isLoading: boolean = true;
  isViewModalOpen: boolean = false;
  selectedOrder: Order | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private orderService: OrderService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.checkQueryParams();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  checkQueryParams(): void {
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        const orderId = params['orderId'];
        if (orderId) {
          this.orderService.getOrderById(orderId).subscribe({
            next: (order: Order) => {
              this.viewOrderDetails(order);
            },
            error: (err: HttpErrorResponse) => {
              console.error('Error fetching order by ID:', err);
              this.errorMessage = `Lỗi khi tải đơn hàng ${orderId}`;
            }
          });
        }
      })
    );
  }

  loadOrders(): void {
    this.isLoading = true;
    console.log('OrderComponent: Starting loadOrders...');
    this.subscriptions.add(
      this.orderService.getOrders().subscribe({
        next: (orders: Order[]) => {
          console.log('OrderComponent: Orders loaded:', orders);
          this.orders = orders.map(order => ({
            ...order,
            productId: order.productId || { name: 'N/A', price: 0 } as Product,
            userId: order.userId || { name: 'N/A' } as User,
            selected: false
          }));
          this.filteredOrders = [...this.orders];
          this.updateStats();
          this.isLoading = false;
          this.errorMessage = null;
        },
        error: (err: HttpErrorResponse) => {
          console.error('OrderComponent: Error loading orders:', err);
          this.errorMessage = 'Lỗi khi tải danh sách đơn hàng: ' + err.message;
          this.isLoading = false;
          this.isViewModalOpen = false;
        }
      })
    );
  }

  applyFilters(): void {
    console.log('OrderComponent: Applying filters:', {
      searchTerm: this.searchTerm,
      statusFilter: this.statusFilter,
      startDate: this.startDate,
      endDate: this.endDate
    });
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch =
        this.searchTerm === '' ||
        order.orderId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (order.productId?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (order.userId?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === '' || order.status === this.statusFilter;

      const orderDate = new Date(order.createdAt);
      const start = this.startDate ? new Date(this.startDate) : null;
      const end = this.endDate ? new Date(this.endDate) : null;
      const matchesDate =
        (!start || orderDate >= start) && (!end || orderDate <= end);

      return matchesSearch && matchesStatus && matchesDate;
    });
    console.log('OrderComponent: Filtered orders:', this.filteredOrders);
    this.updateStats();
  }

  resetFilters(): void {
    console.log('OrderComponent: Resetting filters');
    this.searchTerm = '';
    this.statusFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.isSelectAll = false;
    this.filteredOrders = [...this.orders];
    this.orders.forEach(order => (order.selected = false));
    this.updateStats();
  }

  updateStats(): void {
    this.totalOrders = this.filteredOrders.length;
    this.inProgressOrders = this.filteredOrders.filter(o => o.status === 'inprogress').length;
    this.deliveredOrders = this.filteredOrders.filter(o => o.status === 'delivered').length;
    this.returnOrders = this.filteredOrders.filter(o => o.status === 'return').length;
    console.log('OrderComponent: Stats updated:', {
      totalOrders: this.totalOrders,
      inProgressOrders: this.inProgressOrders,
      deliveredOrders: this.deliveredOrders,
      returnOrders: this.returnOrders
    });
  }

  toggleSelectAll(): void {
    this.isSelectAll = !this.isSelectAll;
    this.filteredOrders.forEach(order => (order.selected = this.isSelectAll));
    console.log('OrderComponent: Select all toggled:', this.isSelectAll);
  }

  updateSelectAll(): void {
    this.isSelectAll = this.filteredOrders.every(order => order.selected);
    console.log('OrderComponent: Select all updated:', this.isSelectAll);
  }

  trackByOrderId(index: number, order: Order): string {
    return order.orderId;
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };
    this.isViewModalOpen = true;
    console.log('OrderComponent: Viewing order details:', order);
  }

  toggleLockOrder(order: Order): void {
    if (!order.orderId) {
      alert('Không thể khóa/mở khóa đơn hàng: Thiếu thông tin đơn hàng');
      return;
    }
    console.log('OrderComponent: Toggling lock for order:', order.orderId);
    this.subscriptions.add(
      this.orderService.toggleOrderLock(order.orderId).subscribe({
        next: (updatedOrder: Order) => {
          const index = this.orders.findIndex(o => o.orderId === order.orderId);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
            this.applyFilters();
            alert(`Đơn hàng ${updatedOrder.orderId} đã được ${updatedOrder.status === 'locked' ? 'khóa' : 'mở khóa'}!`);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('OrderComponent: Error toggling order status:', err);
          alert('Lỗi khi cập nhật trạng thái đơn hàng!');
        }
      })
    );
  }

  deleteOrder(orderId: string): void {
    if (!orderId) {
      alert('Không thể xóa đơn hàng: Thiếu thông tin đơn hàng');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa đơn hàng ${orderId}?`)) {
      console.log('OrderComponent: Deleting order:', orderId);
      this.subscriptions.add(
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            this.orders = this.orders.filter(o => o.orderId !== orderId);
            this.applyFilters();
            alert('Xóa đơn hàng thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('OrderComponent: Error deleting order:', err);
            alert('Lỗi khi xóa đơn hàng!');
          }
        })
      );
    }
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder || !this.selectedOrder.orderId) {
      alert('Không thể cập nhật đơn hàng: Thiếu thông tin đơn hàng');
      return;
    }
    console.log('OrderComponent: Updating order status:', this.selectedOrder.orderId, this.selectedOrder.status);
    this.subscriptions.add(
      this.orderService.updateOrder(this.selectedOrder.orderId, {
        status: this.selectedOrder.status
      }).subscribe({
        next: (updatedOrder: Order) => {
          const index = this.orders.findIndex(o => o.orderId === this.selectedOrder!.orderId);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
            this.selectedOrder = updatedOrder;
            this.applyFilters();
            alert('Cập nhật trạng thái đơn hàng thành công!');
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('OrderComponent: Error updating order:', err);
          alert('Lỗi khi cập nhật trạng thái đơn hàng!');
        }
      })
    );
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedOrder = null;
    console.log('OrderComponent: Modal closed');
  }

  exportData(): void {
    const selectedOrders = this.filteredOrders.filter(o => o.selected);
    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng để xuất!');
      return;
    }
    console.log('OrderComponent: Exporting data for orders:', selectedOrders);
    const csvContent = this.convertToCSV(selectedOrders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orders_export.csv';
    link.click();
  }

  private convertToCSV(orders: Order[]): string {
    const headers = ['ID', 'Sản Phẩm', 'Giá', 'Khách Hàng', 'Số Tiền', 'Thanh Toán', 'Ngày', 'Trạng Thái'];
    const rows = orders.map(order => [
      order.orderId,
      order.productId?.name || 'N/A',
      order.productId?.price.toString() || '0',
      order.userId?.name || 'N/A',
      order.totalAmount.toString(),
      order.payment,
      new Date(order.createdAt).toLocaleDateString('vi-VN'),
      this.translateOrderStatus(order.status)
    ]);
    return [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${v}"`).join(','))
    ].join('\n');
  }

  addNewOrder(): void {
    console.log('OrderComponent: Navigating to add new order');
    this.router.navigate(['/order/add']);
  }

  translateOrderStatus(status: string): string {
    switch (status) {
      case 'delivered': return 'Đã Giao';
      case 'inprogress': return 'Đang Xử Lý';
      case 'return': return 'Trả Hàng';
      case 'locked': return 'Bị Khóa';
      default: return status;
    }
  }
}
