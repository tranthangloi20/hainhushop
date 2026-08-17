import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Category, Product } from '../../shared/models/product.model';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  readonly fallbackImage = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80';

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
  categoryName = '';
  editingCategoryId = '';
  editingCategoryName = '';

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
      this.error = this.readError(error, 'Không thể tải dữ liệu quản trị.');
    } finally {
      this.cdr.detectChanges();
    }
  }

  async save(): Promise<void> {
    if (!this.form.category_id) {
      this.error = 'Vui lòng chọn danh mục.';
      return;
    }
    if (!this.form.name.trim()) {
      this.error = 'Vui lòng nhập tên sản phẩm.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.message = '';

    try {
      await this.service.save(this.form);
      this.message = this.editing ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.';
      this.resetForm();
      await this.load();
    } catch (error) {
      console.error('[HainhuShop] Save error:', error);
      this.error = this.readError(error, 'Không thể lưu sản phẩm.');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  edit(product: Product): void {
    this.form = { ...product, sale_price: product.sale_price ?? null, stock: product.stock ?? 0 };
    this.editing = true;
    this.message = '';
    this.error = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(product: Product): Promise<void> {
    if (!product.id || !window.confirm(`Xóa vĩnh viễn "${product.name}" khỏi database?`)) return;

    try {
      await this.service.remove(product.id);
      this.message = 'Đã xóa sản phẩm khỏi database.';
      await this.load();
    } catch (error) {
      console.error('[HainhuShop] Delete error:', error);
      this.error = this.readError(error, 'Không thể xóa sản phẩm.');
    }
  }

  resetForm(): void {
    this.form = this.emptyProduct();
    this.editing = false;
  }

  filterItems(): void {
    const keyword = this.search.trim().toLowerCase();
    this.filteredItems = this.items.filter((product) => {
      const matchesKeyword = !keyword || product.name.toLowerCase().includes(keyword) || product.description.toLowerCase().includes(keyword);
      const matchesCategory = !this.filterCategory || product.category_id === this.filterCategory;
      return matchesKeyword && matchesCategory;
    });
  }

  async createCategory(): Promise<void> {
    const name = this.categoryName.trim();
    if (!name) return;

    try {
      this.error = '';
      await this.service.createCategory(name);
      this.categoryName = '';
      this.message = 'Đã thêm danh mục.';
      await this.load();
    } catch (error) {
      this.error = this.readError(error, 'Không thể thêm danh mục.');
    }
  }

  startEditCategory(category: Category): void {
    this.editingCategoryId = category.id;
    this.editingCategoryName = category.name;
    this.error = '';
  }

  cancelEditCategory(): void {
    this.editingCategoryId = '';
    this.editingCategoryName = '';
  }

  async updateCategory(category: Category): Promise<void> {
    try {
      this.error = '';
      await this.service.updateCategory({ ...category, name: this.editingCategoryName });
      this.message = 'Đã cập nhật danh mục.';
      this.cancelEditCategory();
      await this.load();
    } catch (error) {
      this.error = this.readError(error, 'Không thể cập nhật danh mục.');
    }
  }

  async removeCategory(category: Category): Promise<void> {
    const hasProducts = this.items.some((product) => product.category_id === category.id);
    const warning = hasProducts
      ? `Danh mục "${category.name}" đang có sản phẩm. Xóa danh mục sẽ bỏ liên kết danh mục của các sản phẩm. Tiếp tục?`
      : `Xóa danh mục "${category.name}"?`;

    if (!window.confirm(warning)) return;

    try {
      this.error = '';
      await this.service.removeCategory(category.id);
      this.message = 'Đã xóa danh mục khỏi database.';
      if (this.form.category_id === category.id) this.form.category_id = '';
      await this.load();
    } catch (error) {
      this.error = this.readError(error, 'Không thể xóa danh mục.');
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.form.category_id) {
      if (file) this.error = 'Hãy chọn danh mục trước khi tải ảnh.';
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
      this.error = this.readError(error, 'Không thể tải ảnh lên. Kiểm tra Storage policy.');
    } finally {
      this.uploading = false;
      this.cdr.detectChanges();
      input.value = '';
    }
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
      stock: 0,
      image_url: '',
      category_id: '',
      is_hot: false,
    };
  }

  private readError(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String((error as { message?: unknown }).message ?? '');
      if (message) return message;
    }
    return fallback;
  }
}
