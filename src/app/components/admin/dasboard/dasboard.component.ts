import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { NgApexchartsModule } from 'ng-apexcharts';
import { OrderService, Order, RevenueData } from '../services/orders.service';
import { StatsService, Stats } from '../services/stats.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NavComponent } from "../nav/nav.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgApexchartsModule, NavComponent],
  templateUrl: './dasboard.component.html',
  styleUrls: ['./dasboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  recentOrders: Order[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  totalRevenue: number = 0;
  revenueGrowth: number = 0;
  totalInventory: number = 0;
  orderGrowth: number = 0;
  totalOrders: number = 0;
  percentageSold: number = 0;
  isChartDataLoaded: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';

  chartOptions: any = {
    series: [],
    chart: {
      type: 'pie',
      height: 350
    },
    labels: [],
    title: {
      text: 'Doanh Thu Theo Danh Mục (VNĐ)',
      align: 'left'
    },
    colors: ['#1e90ff', '#ff4560', '#00e396', '#feb019', '#775dd0', '#ff7300'],
    tooltip: {
      enabled: true
    },
    legend: {
      position: 'bottom'
    }
  };

  legendOptions = this.chartOptions.legend; // ✅ fix lỗi legend

  private subscriptions: Subscription = new Subscription();

  constructor(
    private orderService: OrderService,
    private statsService: StatsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initializeChart();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    this.isLoading = true;

    this.subscriptions.add(
      this.orderService.getOrders().subscribe({
        next: (orders: Order[]) => {
          this.orders = orders.map(order => ({
            ...order,
            productId: order.productId || { name: 'N/A', price: 0, category: 'Khác' },
            userId: order.userId || { name: 'N/A' }
          }));
          this.filteredOrders = this.orders;
          this.recentOrders = this.orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          this.applyFilters();
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi tải đơn hàng: ' + err.message;
          this.isLoading = false;
          this.isChartDataLoaded = false;
        }
      })
    );

    this.subscriptions.add(
      this.statsService.getStats().subscribe({
        next: (stats: Stats) => {
          this.totalRevenue = stats.totalRevenue;
          this.revenueGrowth = stats.revenueGrowth;
          this.totalInventory = stats.totalInventory;
          this.orderGrowth = stats.orderGrowth;
          this.percentageSold = stats.percentageSold;
          this.isChartDataLoaded = true;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi tải thống kê: ' + err.message;
          this.isChartDataLoaded = false;
        }
      })
    );

    this.subscriptions.add(
      this.orderService.getRevenue().subscribe({
        next: (data: RevenueData) => {
          this.totalRevenue = data.totalRevenue;
          this.updateChart(data.revenueByCategory);
          this.isChartDataLoaded = true;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi tải dữ liệu doanh thu: ' + err.message;
          this.isChartDataLoaded = false;
        }
      })
    );
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order =>
      (order.productId?.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.statusFilter ? order.status === this.statusFilter : true)
    );
    this.totalOrders = this.filteredOrders.length;
    this.recentOrders = this.filteredOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    this.updateStats();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  updateStats(): void {
    this.totalOrders = this.filteredOrders.length;
  }

  initializeChart(): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [],
      labels: []
    };
  }

  updateChart(revenueByCategory: { categoryName: string; totalRevenue: number; totalOrders: number }[]): void {
    const categories = revenueByCategory.map(item => item.categoryName);
    const revenueData = revenueByCategory.map(item => item.totalRevenue);

    this.chartOptions = {
      ...this.chartOptions,
      series: revenueData,
      labels: categories
    };
  }

  exportData(): void {
    const csv = this.filteredOrders.map(order => ({
      OrderID: order.orderId,
      ProductName: order.productId?.name || 'N/A',
      User: order.userId?.name || 'N/A',
      TotalAmount: order.totalAmount || 0,
      Payment: order.payment,
      Status: this.translateStatus(order.status),
      Category: order.category,
      CreatedAt: order.createdAt
    }));

    const csvContent = [
      'OrderID,ProductName,User,TotalAmount,Payment,Status,Category,CreatedAt',
      ...csv.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard_orders.csv';
    link.click();
  }

  openSettings(): void {
    alert('Cài đặt chưa được triển khai.');
  }

  generateReport(): void {
    alert('Tạo báo cáo chưa được triển khai.');
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/orders'], { queryParams: { orderId: order.orderId } });
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      delivered: 'Đã Giao',
      inprogress: 'Đang Xử Lý',
      return: 'Trả Hàng',
      locked: 'Bị Khóa'
    };
    return statusMap[status] || status;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.orderId;
  }
}
