import { Routes } from '@angular/router';
import { HomeComponent } from './components/user/home/home.component';
import { ProductComponent } from './components/user/product/product.component';
import { ProductDetailComponent } from './components/user/product-detail/product-detail.component';
import { NewsComponent } from './components/user/news/news.component';
import { CartComponent } from './components/user/cart/cart.component';
import { DashboardComponent } from './components/admin/dasboard/dasboard.component';
import { CategoryListComponent } from './components/admin/category-list/category-list.component';
import { UserLayoutComponent } from './components/user/user-layout.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { LoginComponent } from './components/user/auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'product', component: ProductComponent },
      { path: 'product-detail/:id', component: ProductDetailComponent },
      { path: 'news', component: NewsComponent },
      { path: 'login', component: LoginComponent },
      { path: 'cart', component: CartComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent ,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'category-list', component: CategoryListComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
