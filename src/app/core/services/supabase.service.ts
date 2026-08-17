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
      .select('id,name,slug')
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
        product.sale_price === null ||
        product.sale_price === undefined ||
        product.sale_price === 0
          ? null
          : Number(product.sale_price),
      image_url: product.image_url?.trim() ?? '',
      category_id: product.category_id || null,
      is_hot: Boolean(product.is_hot),
    };

    const query = product.id
      ? this.db.from('products').update(payload).eq('id', product.id)
      : this.db.from('products').insert(payload);

    const { data, error } = await query.select('*, category:categories(id,name,slug)').single();

    if (error) throw error;
    return data as Product;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async uploadProductImage(file: File, categorySlug: string): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .toLowerCase();

    const path = `${categorySlug}/${Date.now()}-${safeName}.${extension}`;

    const { error } = await this.db.storage
      .from('product-images')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = this.db.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
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
}
