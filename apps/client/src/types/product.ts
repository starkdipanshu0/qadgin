export interface ProductType {
  id: number;
  name: string;
  tagline: string; // New: e.g., "Metabolic ACV Moringa"
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number; // To show discounts (MRP vs Selling Price)
  packSize: string[]; // e.g. ["60 Tablets", "Pack of 2"]
  flavors: string[]; // e.g. ["Orange", "Chocolate", "Unflavored"]
  benefits: string[]; // e.g. ["Immunity", "Gut Health"]
  images: {
    [key: string]: string; // Maps flavor/variant to image path
  };
  categorySlug: string;
  isBestSeller?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
