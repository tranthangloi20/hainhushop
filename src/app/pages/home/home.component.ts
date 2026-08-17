import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Category, Product } from '../../shared/models/product.model';
import { SHOP_CONFIG } from '../../core/config/shop.config';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  readonly fallbackImage = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80';
  readonly zaloLink = `https://zalo.me/${SHOP_CONFIG.zaloPhone}`;
  readonly pharmacistTelLink = `tel:${SHOP_CONFIG.pharmacistPhone}`;
  readonly shopPhoneLink = `tel:${SHOP_CONFIG.shopPhone}`;
  readonly config = SHOP_CONFIG;

  items: Product[] = [];
  filteredItems: Product[] = [];
  categories: Category[] = [];
  search = '';
  selectedCategory = '';
  hotOnly = false;
  loading = true;
  error = '';
  selectedProduct: Product | null = null;

  constructor(
    private readonly service: SupabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [products, categories] = await Promise.all([
        this.service.products(),
        this.service.categories(),
      ]);
      this.items = products;
      this.categories = categories;
      this.filterProducts();
    } catch (error) {
      console.error('[HainhuShop] Home load error:', error);
      this.error = 'Không thể tải dữ liệu sản phẩm.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  filterProducts(): void {
    const keyword = this.search.trim().toLowerCase();
    this.filteredItems = this.items.filter((product) => {
      const matchesKeyword = !keyword || product.name.toLowerCase().includes(keyword) || product.description.toLowerCase().includes(keyword);
      const matchesCategory = !this.selectedCategory || product.category_id === this.selectedCategory;
      const matchesHot = !this.hotOnly || Boolean(product.is_hot);
      return matchesKeyword && matchesCategory && matchesHot;
    });
  }

  setHotFilter(value: boolean): void {
    this.hotOnly = value;
    this.filterProducts();
  }

  openProduct(product: Product): void {
    this.selectedProduct = product;
    document.body.classList.add('overflow-hidden');
  }

  closeProduct(): void {
    this.selectedProduct = null;
    document.body.classList.remove('overflow-hidden');
  }

  trackByProduct(index: number, product: Product): string | number {
    return product.id ?? index;
  }
}
