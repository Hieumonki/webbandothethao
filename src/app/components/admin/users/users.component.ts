import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User, UserStats } from '../services/users.service';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats: UserStats = { totalUsers: 0, activeUsers: 0, lockedUsers: 0, totalViolations: 0, pendingUsers: 0 };
  isLoadingUsers = true;
  isLoadingStats = true;
  errorUsers: string | null = null;
  errorStats: string | null = null;
  isUsersModalOpen = false;
  selectAll = false;
  hasSelectedUsers = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    this.isLoadingUsers = true;
    this.isLoadingStats = true;
    this.subscriptions.add(
      forkJoin({
        users: this.usersService.getUsers(),
        stats: this.usersService.getUserStats()
      }).subscribe({
        next: ({ users, stats }) => {
          console.log('Raw users response:', users);
          console.log('Raw user stats response:', stats);
          this.users = users.map(user => ({ ...user, selected: false })) || [];
          this.filteredUsers = this.users;
          const totalViolations = this.users.reduce((sum, user) =>
            sum + (user.spamCount || 0) + (user.cancellationCount || 0) + (user.ghostingCount || 0), 0);
          this.userStats = { ...stats, totalViolations };
          this.isLoadingUsers = false;
          this.isLoadingStats = false;
          console.log('Processed userStats:', this.userStats);
          console.log('Processed users:', this.users);
        },
        error: (err: HttpErrorResponse) => {
          console.error('UsersComponent: Error loading data:', err);
          console.error('Error details:', err.message, err.status, err.error);
          this.errorUsers = 'Lỗi khi tải danh sách người dùng';
          this.errorStats = 'Lỗi khi tải thống kê';
          this.isLoadingUsers = false;
          this.isLoadingStats = false;
          console.log('userStats on error:', this.userStats);
        }
      })
    );
  }

  getPendingUsers(): number {
    return this.userStats.pendingUsers;
  }

  toggleLockUser(user: User): void {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    this.subscriptions.add(
      this.usersService.toggleLockUser(user._id, newStatus === 'locked' ? 'Manually locked by admin' : null).subscribe({
        next: (updatedUser) => {
          const userIndex = this.users.findIndex(u => u._id === updatedUser._id);
          if (userIndex !== -1) {
            this.users[userIndex] = { ...updatedUser, selected: this.users[userIndex].selected };
            this.filteredUsers = [...this.users];
          }
          alert(`Tài khoản ${user.name} đã được ${newStatus === 'locked' ? 'khóa' : 'mở khóa'}!`);
        },
        error: (err: HttpErrorResponse) => {
          console.error('UsersComponent: Error toggling user status:', err);
          alert('Lỗi khi cập nhật trạng thái tài khoản!');
        }
      })
    );
  }

  viewUserDetails(user: User): void {
    const violations = this.getViolationDetails(user);
    alert(`Chi tiết khách hàng:
Tên: ${user.name}
Email: ${user.email}
Số Điện Thoại: ${user.phone ?? 'N/A'}
Địa Chỉ: ${user.address ?? 'N/A'}
Trạng Thái: ${this.translateUserStatus(user.status)}
Đơn Hàng: ${user.orderCount ?? 0}
Trả Hàng: ${user.returnCount ?? 0}
Vi Phạm: ${violations}
Lý Do Khóa: ${user.lockReason ?? 'N/A'}`);
  }

  deleteUser(user: User): void {
    if (confirm(`Bạn có chắc muốn xóa khách hàng ${user.name}?`)) {
      this.subscriptions.add(
        this.usersService.deleteUser(user._id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u._id !== user._id);
            this.filteredUsers = this.filteredUsers.filter(u => u._id !== user._id);
            alert(`Xóa khách hàng ${user.name} thành công!`);
          },
          error: (err: HttpErrorResponse) => {
            console.error('UsersComponent: Error deleting user:', err);
            alert('Lỗi khi xóa khách hàng!');
          }
        })
      );
    }
  }

  deleteSelectedUsers(): void {
    const selectedUsers = this.filteredUsers.filter(user => user.selected);
    if (selectedUsers.length === 0) {
      alert('Vui lòng chọn khách hàng để xóa.');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa ${selectedUsers.length} khách hàng đã chọn?`)) {
      this.subscriptions.add(
        this.usersService.deleteUsers(selectedUsers.map(u => u._id)).subscribe({
          next: () => {
            this.users = this.users.filter(u => !u.selected);
            this.filteredUsers = this.filteredUsers.filter(u => !u.selected);
            this.hasSelectedUsers = false;
            this.selectAll = false;
            alert('Xóa khách hàng thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('UsersComponent: Error deleting users:', err);
            alert('Lỗi khi xóa khách hàng!');
          }
        })
      );
    }
  }

  filterUsersByStatus(status: string): void {
    this.filteredUsers = this.users.filter(user => user.status.toLowerCase().includes(status.toLowerCase()));
    if (this.filteredUsers.length === 0) {
      alert('Không tìm thấy khách hàng với trạng thái này. Hiển thị tất cả khách hàng.');
      this.filteredUsers = [...this.users];
    } else {
      alert(`Hiển thị ${this.filteredUsers.length} khách hàng với trạng thái: ${this.translateUserStatus(status)}`);
    }
  }

  getViolationDetails(user: User): string {
    const violations = [];
    if (user.spamCount > 0) violations.push(`Spam: ${user.spamCount}`);
    if (user.cancellationCount > 0) violations.push(`Hủy Đơn: ${user.cancellationCount}`);
    if (user.ghostingCount > 0) violations.push(`Bom Hàng: ${user.ghostingCount}`);
    if (user.lockReason) violations.push(`Lý Do Khóa: ${user.lockReason}`);
    return violations.length > 0 ? violations.join(', ') : 'Không có';
  }

  translateUserStatus(status: string): string {
    switch (status) {
      case 'active': return 'Hoạt Động';
      case 'locked': return 'Bị Khóa';
      case 'pending': return 'Đang Chờ';
      default: return status;
    }
  }

  openUsersModal(event: Event): void {
    event.preventDefault();
    this.isUsersModalOpen = true;
  }

  closeUsersModal(): void {
    this.isUsersModalOpen = false;
    this.selectAll = false;
    this.filteredUsers.forEach(user => user.selected = false);
    this.hasSelectedUsers = false;
  }

  toggleSelectAll(): void {
    this.filteredUsers.forEach(user => user.selected = this.selectAll);
    this.updateSelectedUsers();
  }

  updateSelectedUsers(): void {
    this.hasSelectedUsers = this.filteredUsers.some(user => user.selected);
    this.selectAll = this.filteredUsers.every(user => user.selected);
  }

  openSettings(): void {
    alert('Chức năng cài đặt đang được phát triển!');
  }

  exportUsers(): void {
    const headers = ['Tên Khách Hàng', 'Email', 'Số Điện Thoại', 'Địa Chỉ', 'Trạng Thái', 'Vi Phạm', 'Sản Phẩm'];
    const rows = this.users.map(user => [
      user.name,
      user.email,
      user.phone || 'N/A',
      user.address || 'N/A',
      this.translateUserStatus(user.status),
      this.getViolationDetails(user) || 'Không có',
      user.products?.map(p => `${p.name} (${p.status})`).join('; ') || 'Không có sản phẩm'
    ].map(field => `"${field}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Xuất dữ liệu khách hàng thành công!');
  }

  trackByUserId(index: number, user: User): string {
    return user._id;
  }
}
