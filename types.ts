
export interface Cpu {
  id: string;
  name: string;
  socket: string;
  price: number;
  manufacturer: 'AMD' | 'Intel' | 'Unknown';
  isServer: boolean;
}

export interface CartItem {
  cpu: Cpu;
  quantity: number;
}

export interface User {
  email: string;
}
