import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import { Category, Product } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly db: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
  );

  async products(): Promise<Product[]> {
    const { data, error } = await this.db
      .from('products')
      .select('*, category:categories(id,name,slug)')
      .order('is_hot', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Product[];
  }

  async categories(): Promise<Category[]> {
    const { data, error } = await this.db
      .from('categories')
      .select('id,name,slug,created_at')
      .order('name');

    if (error) throw error;
    return (data ?? []) as Category[];
  }

  async save(product: Product): Promise<Product> {
    const payload = {
      name: product.name.trim(),
      description: product.description?.trim() ?? '',
      price: Number(product.price),
      sale_price:
        product.sale_price === null || product.sale_price === undefined || product.sale_price === 0
          ? null
          : Number(product.sale_price),
      stock: Math.max(0, Number(product.stock ?? 0)),
      image_url: product.image_url?.trim() ?? '',
      category_id: product.category_id || null,
      is_hot: Boolean(product.is_hot),
      updated_at: new Date().toISOString(),
    };

    const query = product.id
      ? this.db.from('products').update(payload).eq('id', product.id)
      : this.db.from('products').insert(payload);

    const { data, error } = await query
      .select('*, category:categories(id,name,slug)')
      .single();

    if (error) throw error;
    return data as Product;
  }

  async remove(product: Product): Promise<void> {
    if (!product.id) throw new Error('Không tìm thấy ID sản phẩm.');

    // Xóa record trong database trước. Đây là DELETE thật, không chỉ ẩn sản phẩm.
    const { error: dbError } = await this.db
      .from('products')
      .delete()
      .eq('id', product.id);

    if (dbError) throw dbError;

    // Nếu ảnh nằm trong Supabase Storage thì xóa luôn object tương ứng.
    // Ảnh ngoài (ví dụ Unsplash) sẽ được bỏ qua.
    const storagePath = this.storagePathFromPublicUrl(product.image_url);
    if (!storagePath) return;

    const { error: storageError } = await this.db.storage
      .from('product-images')
      .remove([storagePath]);

    if (storageError) {
      console.warn('[HainhuShop] Product deleted but storage image could not be removed:', storageError);
    }
  }

  async removeCategory(id: string): Promise<void> {
    const { error } = await this.db.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  async createCategory(name: string): Promise<Category> {
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Tên danh mục không được để trống.');

    const { data, error } = await this.db
      .from('categories')
      .insert({ name: cleanName, slug: this.slugify(cleanName) })
      .select('id,name,slug,created_at')
      .single();

    if (error) throw error;
    return data as Category;
  }

  async updateCategory(category: Category): Promise<Category> {
    const cleanName = category.name.trim();
    if (!cleanName) throw new Error('Tên danh mục không được để trống.');

    const { data, error } = await this.db
      .from('categories')
      .update({ name: cleanName, slug: this.slugify(cleanName) })
      .eq('id', category.id)
      .select('id,name,slug,created_at')
      .single();

    if (error) throw error;
    return data as Category;
  }

  async uploadProductImage(file: File, categorySlug: string): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .toLowerCase();
    const path = `${categorySlug}/${Date.now()}-${safeName}.${extension}`;

    const { error } = await this.db.storage.from('product-images').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) throw error;
    return this.db.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  async login(email: string, password: string) {
    return this.db.auth.signInWithPassword({ email, password });
  }

  async logout() {
    return this.db.auth.signOut();
  }

  async user() {
    return (await this.db.auth.getUser()).data.user;
  }

  private storagePathFromPublicUrl(imageUrl?: string): string | null {
    if (!imageUrl) return null;

    try {
      const url = new URL(imageUrl);
      const marker = '/storage/v1/object/public/product-images/';
      const index = url.pathname.indexOf(marker);

      if (index === -1) return null;

      const encodedPath = url.pathname.slice(index + marker.length);
      return decodeURIComponent(encodedPath);
    } catch {
      return null;
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
