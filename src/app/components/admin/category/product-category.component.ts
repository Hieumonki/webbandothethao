import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CategoryService, Category } from '../services/product-category.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.css']
})
export class ProductCategoryComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  totalCategories: number = 0;
  activeCategories: number = 0;
  inactiveCategories: number = 0;
  isAddModalOpen: boolean = false;
  isEditing: boolean = false;
  currentCategory: Category = {
    _id: '',
    code: '',
    name: '',
    status: 'active'
  };
  errorMessage: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCategories(): void {
    this.subscriptions.add(
      this.categoryService.getCategories().subscribe({
        next: (categories: Category[]) => {
          console.log('Loaded categories:', categories);
          this.categories = categories;
          this.filteredCategories = categories;
          this.updateStats();
          this.errorMessage = '';
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading categories:', err);
          this.errorMessage = 'Lỗi tải danh mục: ' + (err.statusText || 'Lỗi không xác định');
        }
      })
    );
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter(category =>
      (category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       category.code.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.statusFilter ? category.status === this.statusFilter : true)
    );
    this.updateStats();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  updateStats(): void {
    this.totalCategories = this.filteredCategories.length;
    this.activeCategories = this.filteredCategories.filter(c => c.status === 'active').length;
    this.inactiveCategories = this.filteredCategories.filter(c => c.status === 'inactive').length;
  }

  openAddModal(): void {
    this.currentCategory = {
      _id: '',
      code: '',
      name: '',
      status: 'active'
    };
    this.isAddModalOpen = true;
    this.isEditing = false;
  }

  editCategory(category: Category): void {
    this.currentCategory = { ...category };
    this.isAddModalOpen = true;
    this.isEditing = true;
  }

  closeModal(): void {
    this.isAddModalOpen = false;
    this.currentCategory = {
      _id: '',
      code: '',
      name: '',
      status: 'active'
    };
    this.isEditing = false;
    this.errorMessage = '';
  }

  saveCategory(): void {
    if (!this.currentCategory.name || !this.currentCategory.code) {
      this.errorMessage = 'Vui lòng nhập đầy đủ các trường bắt buộc.';
      return;
    }

    if (this.isEditing && this.currentCategory._id) {
      this.subscriptions.add(
        this.categoryService.updateCategory(this.currentCategory._id, this.currentCategory).subscribe({
          next: (updatedCategory: Category) => {
            this.categories = this.categories.map(c => c._id === updatedCategory._id ? updatedCategory : c);
            this.applyFilters();
            this.closeModal();
            alert('Cập nhật danh mục thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error updating category:', err);
            this.errorMessage = 'Lỗi cập nhật danh mục: ' + (err.statusText || 'Lỗi không xác định');
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.categoryService.createCategory(this.currentCategory).subscribe({
          next: (newCategory: Category) => {
            this.categories.push(newCategory);
            this.applyFilters();
            this.closeModal();
            alert('Thêm danh mục thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error creating category:', err);
            this.errorMessage = 'Lỗi thêm danh mục: ' + (err.statusText || 'Lỗi không xác định');
          }
        })
      );
    }
  }

  deleteCategory(categoryId: string): void {
    if (confirm(`Bạn có chắc muốn xóa danh mục ${categoryId}?`)) {
      this.subscriptions.add(
        this.categoryService.deleteCategory(categoryId).subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c._id !== categoryId);
            this.applyFilters();
            alert('Xóa danh mục thành công!');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error deleting category:', err);
            this.errorMessage = 'Lỗi xóa danh mục: ' + (err.statusText || 'Lỗi không xác định');
          }
        })
      );
    }
  }

  exportData(): void {
    const csv = this.filteredCategories.map(category => ({
      Code: category.code,
      Name: category.name,
      Status: this.translateStatus(category.status)
    }));

    const csvContent = [
      'Code,Name,Status',
      ...csv.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'categories.csv';
    link.click();
  }

  openSettings(): void {
    alert('Cài đặt chưa được triển khai.');
  }

  viewAllCategories(event: Event): void {
    event.preventDefault();
    this.resetFilters();
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      active: 'Hoạt Động',
      inactive: 'Không Hoạt Động'
    };
    return statusMap[status] || status;
  }

  trackByCategoryId(index: number, category: Category): string {
    return category._id;
  }
}
