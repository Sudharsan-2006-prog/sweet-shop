/**
 * Shared Type Definitions for Mithai Lounge & AI Concierge
 */

export interface SweetItem {
  id: string;
  name: string;
  category: 'Traditional' | 'Sugar-Free' | 'Festive Specials';
  price: number; // in INR (₹)
  weight: string; // e.g., "250g" or "Pack of 4"
  description: string;
  imageUrl: string;
  ingredients: string[];
  nutritionalDetails: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    sugar: string;
  };
  flavorProfile: string[]; // e.g. ["Saffron", "Creamy", "Aromatic"]
  pairings: string[]; // complementary item IDs or keywords
  rating: number;
  isPopular?: boolean;
}

export interface CartItem {
  id: string;
  product: SweetItem;
  quantity: number;
}

export interface CustomGiftBox {
  id: string;
  boxDesign: 'Velvet Royal Crimson' | 'Celestial Festive Gold' | 'Chancery Ivory Pearl';
  boxSize: '4-Piece (Compact)' | '9-Piece (Classic)' | '16-Piece (Grand)';
  boxPrice: number; // Base Price
  items: Array<{
    sweetId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customNote: string;
  totalCost: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  email: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    isCustomGift?: boolean;
  }>;
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  status: 'ORDERED' | 'SHIPPED' | 'DELIVERED';
  date: string;
  deliveryAddress: string;
  estimatedDeliveryDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isOrderLookup?: boolean;
}
