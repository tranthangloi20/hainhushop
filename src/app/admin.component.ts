import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Category, Product } from './models';
import { SupabaseService } from './supabase.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="bg-stone-100 px-4 py-8 sm:px-6 lg:py-12">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-black tracking-[0.22em] text-amber-700">ADMIN</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
              Quản lý sản phẩm
            </h1>
            <p class="mt-2 text-sm text-stone-500">
              Thêm, sửa, xóa, phân loại và tải ảnh sản phẩm trực tiếp lên Supabase Storage.
            </p>
          </div>

          <button
            type="button"
            (click)="logout()"
            class="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50"
          >
            Đăng xuất
          </button>
        </div>

        <div class="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-black">
                {{ editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}
              </h2>

              <button
                *ngIf="editing"
                type="button"
                (click)="resetForm()"
                class="text-xs font-bold text-stone-500 hover:text-stone-900"
              >
                Hủy sửa
              </button>
            </div>

            <form class="mt-6 space-y-4" (ngSubmit)="save()">
              <label class="block">
                <span class="mb-2 block text-sm font-bold text-stone-700">Tên sản phẩm</span>
                <input
                  [(ngModel)]="form.name"
                  name="name"
                  required
                  class="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                  placeholder="Ví dụ: Nước giặt Hải Như"
                />
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-bold text-stone-700">Danh mục</span>
                <select
                  [(ngModel)]="form.category_id"
                  name="category_id"
                  required
                  class="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-700"
                >
                  <option value="">Chọn danh mục</option>
                  <option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-bold text-stone-700">Mô tả</span>
                <textarea
                  [(ngModel)]="form.description"
                  name="description"
                  rows="4"
                  class="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                  placeholder="Mô tả ngắn..."
                ></textarea>
              </label>

              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="mb-2 block text-sm font-bold text-stone-700">Giá gốc</span>
                  <input
                    [(ngModel)]="form.price"
                    name="price"
                    type="number"
                    min="0"
                    required
                    class="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                  />
                </label>

                <label class="block">
                  <span class="mb-2 block text-sm font-bold text-stone-700">Giá KM</span>
                  <input
                    [(ngModel)]="form.sale_price"
                    name="sale_price"
                    type="number"
                    min="0"
                    class="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                    placeholder="Để trống nếu không KM"
                  />
                </label>
              </div>

              <label class="flex items-center gap-3 rounded-2xl bg-rose-50 p-4">
                <input
                  [(ngModel)]="form.is_hot"
                  name="is_hot"
                  type="checkbox"
                  class="h-5 w-5 accent-rose-600"
                />
                <span>
                  <strong class="block text-sm font-black text-rose-700">🔥 Sản phẩm HOT</strong>
                  <span class="text-xs text-rose-600">Hiển thị nổi bật ở trang chủ.</span>
                </span>
              </label>

              <div class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
                <div class="text-sm font-black text-stone-800">Ảnh sản phẩm</div>
                <p class="mt-1 text-xs leading-5 text-stone-500">
                  Ảnh sẽ được lưu theo thư mục danh mục trong bucket product-images.
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  (change)="onFileSelected($event)"
                  class="mt-3 block w-full text-sm"
                />

                <div *ngIf="uploading" class="mt-2 text-xs font-bold text-amber-700">
                  Đang tải ảnh lên...
                </div>

                <img
                  *ngIf="form.image_url"
                  [src]="form.image_url"
                  class="mt-4 h-40 w-full rounded-2xl object-cover"
                  alt="Ảnh sản phẩm"
                />

                <input
                  [(ngModel)]="form.image_url"
                  name="image_url"
                  class="mt-3 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs outline-none"
                  placeholder="Hoặc dán URL ảnh"
                />
              </div>

              <button
                [disabled]="saving || uploading"
                class="w-full rounded-2xl bg-stone-900 px-4 py-3.5 font-black text-white hover:bg-stone-700 disabled:opacity-50"
              >
                {{ saving ? 'Đang lưu...' : editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm' }}
              </button>

              <p *ngIf="message" class="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {{ message }}
              </p>

              <p *ngIf="error" class="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                {{ error }}
              </p>
            </form>
          </aside>

          <div>
            <div class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-3 md:flex-row">
                <input
                  [(ngModel)]="search"
                  (ngModelChange)="filterItems()"
                  placeholder="Tìm sản phẩm..."
                  class="flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-700"
                />

                <select
                  [(ngModel)]="filterCategory"
                  (ngModelChange)="filterItems()"
                  class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold outline-none"
                >
                  <option value="">Tất cả danh mục</option>
                  <option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <article
                *ngFor="let product of filteredItems; trackBy: trackByProduct"
                class="grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[110px_1fr_auto] sm:items-center"
              >
                <img
                  [src]="product.image_url || fallbackImage"
                  [alt]="product.name"
                  class="h-28 w-full rounded-2xl object-cover sm:w-28"
                />

                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      *ngIf="product.is_hot"
                      class="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700"
                    >
                      🔥 HOT
                    </span>
                    <span class="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600">
                      {{ product.category?.name || 'Chưa phân loại' }}
                    </span>
                  </div>

                  <h3 class="mt-2 truncate text-lg font-black text-stone-950">
                    {{ product.name }}
                  </h3>

                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <strong>{{ (product.sale_price || product.price) | currency:'VND':'symbol':'1.0-0' }}</strong>
                    <del *ngIf="product.sale_price" class="text-xs text-stone-400">
                      {{ product.price | currency:'VND':'symbol':'1.0-0' }}
                    </del>
                  </div>
                </div>

                <div class="flex gap-2 sm:flex-col">
                  <button
                    type="button"
                    (click)="edit(product)"
                    class="rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold hover:bg-stone-50"
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    (click)="remove(product)"
                    class="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    Xóa
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AdminComponent implements OnInit {
  readonly fallbackImage =
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80';

  items: Product[] = [];
  filteredItems: Product[] = [];
  categories: Category[] = [];

  search = '';
  filterCategory = '';
  saving = false;
  uploading = false;
  editing = false;
  error = '';
  message = '';

  form: Product = this.emptyProduct();

  constructor(
    private readonly service: SupabaseService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    try {
      [this.items, this.categories] = await Promise.all([
        this.service.products(),
        this.service.categories(),
      ]);

      this.filterItems();
    } catch (error) {
      console.error('[HainhuShop] Admin load error:', error);
      this.error = 'Không thể tải dữ liệu quản trị.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.form.category_id) {
      if (file) {
        this.error = 'Hãy chọn danh mục trước khi tải ảnh.';
      }
      return;
    }

    const category = this.categories.find((item) => item.id === this.form.category_id);

    if (!category) return;

    this.uploading = true;
    this.error = '';

    try {
      this.form.image_url = await this.service.uploadProductImage(file, category.slug);
      this.message = 'Đã tải ảnh lên.';
    } catch (error) {
      console.error('[HainhuShop] Upload error:', error);
      this.error = 'Không thể tải ảnh lên. Kiểm tra Storage policy.';
    } finally {
      this.uploading = false;
      this.cdr.detectChanges();
      input.value = '';
    }
  }

  async save(): Promise<void> {
    if (!this.form.category_id) {
      this.error = 'Vui lòng chọn danh mục.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.message = '';

    try {
      await this.service.save(this.form);
      this.message = this.editing
        ? 'Đã cập nhật sản phẩm.'
        : 'Đã thêm sản phẩm.';

      this.resetForm();
      await this.load();
    } catch (error) {
      console.error('[HainhuShop] Save error:', error);
      this.error = 'Không thể lưu sản phẩm.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  edit(product: Product): void {
    this.form = {
      ...product,
      sale_price: product.sale_price ?? null,
    };
    this.editing = true;
    this.message = '';
    this.error = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(product: Product): Promise<void> {
    if (!product.id || !window.confirm(`Xóa "${product.name}"?`)) return;

    try {
      await this.service.remove(product.id);
      this.message = 'Đã xóa sản phẩm.';
      await this.load();
    } catch (error) {
      console.error('[HainhuShop] Delete error:', error);
      this.error = 'Không thể xóa sản phẩm.';
    }
  }

  resetForm(): void {
    this.form = this.emptyProduct();
    this.editing = false;
  }

  filterItems(): void {
    const keyword = this.search.trim().toLowerCase();

    this.filteredItems = this.items.filter((product) => {
      const matchesKeyword =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);

      const matchesCategory =
        !this.filterCategory ||
        product.category_id === this.filterCategory;

      return matchesKeyword && matchesCategory;
    });
  }

  async logout(): Promise<void> {
    await this.service.logout();
    await this.router.navigateByUrl('/login');
  }

  trackByProduct(index: number, product: Product): string | number {
    return product.id ?? index;
  }

  private emptyProduct(): Product {
    return {
      name: '',
      description: '',
      price: 0,
      sale_price: null,
      image_url: '',
      category_id: '',
      is_hot: false,
    };
  }
}
