import type { Product } from '../types';

export const CATALOG: Product[] = [
    {
        id: 'p-1',
        name: 'MacBook Pro 16"',
        description: 'M3 Max, 64GB RAM, 2TB SSD - For ultimate performance.',
        price: 3499.00,
        category: 'Computers',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 5,
        weightKg: 2.1,
        requiresApproval: true
    },
    {
        id: 'p-2',
        name: 'ThinkPad X1 Carbon Gen 11',
        description: 'Premium business ultrabook with Windows 11 Pro.',
        price: 1899.00,
        category: 'Computers',
        image: 'https://images.unsplash.com/photo-1536768340156-f61b09228eb3?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 3,
        weightKg: 1.1
    },
    {
        id: 'p-3',
        name: 'Logitech MX Master 3S',
        description: 'Advanced wireless mouse for comfort and productivity.',
        price: 99.00,
        category: 'Peripherals',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 1,
        weightKg: 0.3
    },
    {
        id: 'p-4',
        name: 'Keychron K8 Pro',
        description: 'Mechanical wireless keyboard with hot-swappable switches.',
        price: 115.00,
        category: 'Peripherals',
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 2,
        weightKg: 1.0
    },
    {
        id: 'p-5',
        name: 'Visual Studio Enterprise 2022',
        description: 'Comprehensive IDE for Windows developers.',
        price: 499.00,
        category: 'Software',
        image: 'https://images.unsplash.com/photo-1618401471353-b98a5233c591?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 0,
        weightKg: 0.0
    },
    {
        id: 'p-6',
        name: 'Figma Professional License (1 yr)',
        description: 'Collaborative interface design tool.',
        price: 144.00,
        category: 'Software',
        image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 0,
        weightKg: 0.0
    },
    {
        id: 'p-7',
        name: 'Staples Premium Copy Paper (Box of 2)',
        description: 'Must be bought in pairs (box of 2 reams).',
        price: 15.00,
        category: 'Office Supplies',
        image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 2,
        weightKg: 5.0
    },
    {
        id: 'p-8',
        name: 'ErgoChair Pro',
        description: 'Fully adjustable ergonomic office chair.',
        price: 499.00,
        category: 'Office Supplies',
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 7,
        weightKg: 22.0
    },
    {
        id: 'fee-1',
        name: 'Software Licensing Admin Fee',
        description: 'Mandatory processing fee for software licenses.',
        price: 25.00,
        category: 'Software',
        image: 'https://images.unsplash.com/photo-1618401471353-b98a5233c591?auto=format&fit=crop&q=80&w=600',
        deliveryDays: 0,
        weightKg: 0.0
    }
];
