export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  image_url: string;
  category_id?: string | null;
  category?: Category | null;
  is_hot?: boolean;
  created_at?: string;
  updated_at?: string;
}
