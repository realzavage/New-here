export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  location: string;
  description: string;
  imageUrl: string;
  seller: string;
  condition: 'New' | 'Used' | 'Like New';
}