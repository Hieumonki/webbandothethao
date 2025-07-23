import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductComponent } from './components/product/product.component';
import { LoginComponent } from './components/auth/login/login.component';
import { CartComponent } from './components/cart/cart.component';

import { DasboardComponent } from './components/admin/dasboard/dasboard.component';
import { CategoryListComponent } from './components/admin/category-list/category-list.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'product', component: ProductComponent },
  { path: 'product-detail/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin', component: DasboardComponent,
    children: [
      { path: 'category-list', component: CategoryListComponent },
    ]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
