
export interface Cpu {
  id: string;
  name: string;
  socket: string;
  price: number;
  manufacturer: 'AMD' | 'Intel' | 'Unknown';
  isServer: boolean;
  category: 'CPU';
}

export interface Motherboard {
    id: string;
    name: string;
    socket: string;
    formFactor: string;
    price: number;
    category: 'Motherboard';
}

export interface Ram {
    id: string;
    name: string;
    vendor: string;
    type: string;
    capacity: string;
    price: number;
    category: 'RAM';
}

export type Product = Cpu | Motherboard | Ram;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  email: string;
}