export interface ProductProps {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories?: string[];
  price: number;
  latitude: number;
  longitude: number;
  popularity?: number;
  createdAt: Date;
  updatedAt: Date;
}
