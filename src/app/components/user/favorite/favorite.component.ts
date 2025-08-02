import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ thêm dòng này
import { FavoriteService } from '../../../services/favorite.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule], // ✅ thêm vào đây
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent {
  favorites: Product[] = [];

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.favoriteService.favorites$.subscribe((data) => {
      this.favorites = data;
    });
  }

  removeFromFavorites(productId: string): void {
    this.favoriteService.removeFavorite(productId);
  }
}
