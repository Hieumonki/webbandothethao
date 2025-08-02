import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../../services/news.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-news',
  standalone :true,
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
   imports: [ CommonModule]
})
export class NewsComponent implements OnInit {
  newsList: any[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getAllNews().subscribe(data => {
      this.newsList = data;
    });
  }
}
