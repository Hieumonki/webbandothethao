import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './../../../services/auth.service';
import { CategoryService } from '../../../services/category.service';
import { CartService } from '../../../services/cart.service';
import { Category } from '../../../models/category';
import { FavoriteService } from '../../../services/favorite.service'; // ✅ THÊM

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [RouterModule, FormsModule, CommonModule]
})
export class HeaderComponent implements OnInit {
  keyword: string = '';
  categories!: Category[];
  selectedCategory: string | null = null;
  isADM: any;
  isLogin: any;
  cartQuantity: number = 0;

  favoriteCount: number = 0; // ✅ Đếm yêu thích

  constructor(
    private CategoryService: CategoryService,
    private router: Router,
    private AuthService: AuthService,
    private cartService: CartService,
    private favoriteService: FavoriteService // ✅ Inject dịch vụ yêu thích
  ) {
    this.isADM = AuthService.checkAdmin();
    this.isLogin = AuthService.checkLogin();
  }

  ngOnInit(): void {
    this.CategoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartQuantity = count;
    });

    // ✅ Theo dõi số lượng sản phẩm yêu thích
    this.favoriteService.favorites$.subscribe(favorites => {
      this.favoriteCount = favorites.length;
    });
  }

  onSeach() {
    if (this.keyword.trim().length < 3) {
      alert('Hãy nhập ít nhất 3 ký tự');
      return;
    }

    const queryParams: any = {
      keyword: this.keyword,
    };

    if (this.selectedCategory) {
      queryParams.category = this.selectedCategory;
    }

    this.router.navigate(['/product'], { queryParams });
  }

  onAccountAction(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'logout') {
      this.onLogout();
    } else {
      this.router.navigate([value]);
    }
  }

  onLogout() {
    localStorage.clear();
    location.assign('/');
  }
}
