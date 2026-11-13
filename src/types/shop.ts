export type SectionId = 'home' | 'shop' | 'contact';

export type CharacterBehavior =
  | 'greeting_idle'
  | 'notice_visitor'
  | 'inspect_bag'
  | 'showcase_supply'
  | 'pack_stride'
  | 'relaxed_wave';

export type ProductCategory =
  | 'All'
  | 'Bags & Backpacks'
  | 'Notebooks'
  | 'Pens & Math Sets'
  | 'Uniforms'
  | 'Shoes & Socks'
  | 'Water Bottles'
  | 'Lunch Boxes'
  | 'Accessories';

export interface Product {
  id: string;
  name: string;
  category: Exclude<ProductCategory, 'All'>;
  price: number;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  variants?: string[];
  inStock: boolean;
  artworkId:
    | 'violet-backpack'
    | 'explorer-pack'
    | 'ruled-notebooks'
    | 'grid-journal'
    | 'math-geometry-set'
    | 'gel-pencil-kit'
    | 'pleated-uniform'
    | 'oxford-uniform'
    | 'school-sneakers'
    | 'cotton-socks'
    | 'insulated-bottle'
    | 'bento-lunchbox'
    | 'desk-atlas-kit';
  accentHex: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'card' | 'cash_on_delivery';

export interface ContactPayload {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}
