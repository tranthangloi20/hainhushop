import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule,
  CurrencyPipe
} from '@angular/common';

import { SupabaseService } from './supabase.service';
import { Product } from './models';

@Component({
  standalone: true,

  imports: [
    CommonModule,
    CurrencyPipe
  ],

  template: `
    <section class="hero">
      <div class="wrap">
        <small>HẢI NHƯ SHOP</small>

        <h1>
          Hàng thiết yếu<br />
          <em>cho mọi gia đình.</em>
        </h1>

        <p>
          Sản phẩm tiện dụng, giá hợp lý và được tuyển chọn
          cho cuộc sống mỗi ngày.
        </p>
      </div>
    </section>

    <section class="wrap products">

      <div class="title">
        <div>
          <small>SẢN PHẨM</small>

          <h2>Mua sắm dễ dàng</h2>
        </div>

        <span>
          {{ items.length }} sản phẩm
        </span>
      </div>

      <!-- LOADING -->
      <p
        class="empty"
        *ngIf="loading"
      >
        Đang tải sản phẩm...
      </p>

      <!-- ERROR -->
      <div
        class="empty error"
        *ngIf="!loading && error"
      >
        {{ error }}
      </div>

      <!-- EMPTY -->
      <p
        class="empty"
        *ngIf="
          !loading &&
          !error &&
          items.length === 0
        "
      >
        Chưa có sản phẩm nào.
      </p>

      <!-- PRODUCTS -->
      <div
        class="grid"
        *ngIf="
          !loading &&
          !error &&
          items.length > 0
        "
      >

        <article
          *ngFor="
            let p of items;
            trackBy: trackByProduct
          "
        >

          <img
            [src]="p.image_url"
            [alt]="p.name"
            loading="lazy"
            (error)="onImageError($event)"
          />

          <div>

            <h3>
              {{ p.name }}
            </h3>

            <p>
              {{ p.description }}
            </p>

            <strong>
              {{
                p.price
                  | currency:'VND':'symbol':'1.0-0'
              }}
            </strong>

            <button
              type="button"
            >
              Thêm vào giỏ
            </button>

          </div>

        </article>

      </div>

    </section>
  `
})
export class HomeComponent implements OnInit {

  items: Product[] = [];

  loading = true;

  error = '';

  constructor(
    private readonly s: SupabaseService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {

    this.loading = true;

    this.error = '';

    try {

      console.log(
        '[HainhuShop] Loading products...'
      );

      const products = await this.s.products();

      console.log(
        '[HainhuShop] Products loaded:',
        products
      );

      if (Array.isArray(products)) {

        this.items = products;

      } else {

        this.items = [];

      }

    } catch (err) {

      console.error(
        '[HainhuShop] Products error:',
        err
      );

      this.items = [];

      this.error =
        'Không thể tải sản phẩm. Vui lòng thử lại sau.';

    } finally {

      this.loading = false;

      console.log(
        '[HainhuShop] Loading finished. Count:',
        this.items.length
      );

      /*
       * Supabase trả Promise bên ngoài Angular
       * nên ép Angular chạy change detection
       * sau khi dữ liệu đã được load.
       */
      this.cdr.detectChanges();

    }

  }

  trackByProduct(
    index: number,
    product: Product
  ): string | number {

    return product.id ?? index;

  }

  onImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    image.style.display = 'none';

  }

}