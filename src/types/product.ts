export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  addedAt: string;
};

export type ProductListResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
};
