export type Category = 'Computers' | 'Peripherals' | 'Software' | 'Office Supplies';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  deliveryDays: number; // For delivery time rule
  weightKg: number;    // For freight rules
  requiresApproval?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

// --- Procurement Models (SAP Ariba Buying Scope) ---

export type RequisitionStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Denied' | 'PO Created' | 'Shipped' | 'Received';

export interface Requisition {
  id: string; // e.g., REQ-1001
  date: string;
  items: CartItem[];
  totalPrice: number;
  mpk: string;
  glAccount: string;
  requiresManagerApproval: boolean;
  status: RequisitionStatus;
  justification?: string;
  // Non-catalog fields if present
  isNonCatalog?: boolean;
}

export type POStatus = 'Ordered' | 'Confirmed' | 'Shipped' | 'Partially Received' | 'Received' | 'Invoiced' | 'Closed';

export interface PurchaseOrder {
  id: string; // e.g., PO-5001
  requisitionId: string;
  date: string;
  items: CartItem[];
  totalPrice: number;
  status: POStatus;
  supplier: string; // e.g., "IT Supplies Inc."
}

export interface GoodsReceipt {
  id: string; // e.g., GR-9001
  poId: string;
  date: string;
  receivedItems: { productId: string; quantity: number }[];
}


// --- Commerce Automation Models (Supplier Scope) ---

export type OCStatus = 'Accept' | 'Reject' | 'Backorder';

export interface OrderConfirmation {
  id: string; // e.g., OC-8001
  poId: string;
  date: string;
  status: OCStatus;
  message?: string;
}

export interface ShipNotice {
  id: string; // e.g., ASN-7001
  poId: string;
  date: string;
  trackingNumber: string;
  shippedItems: { productId: string; quantity: number }[];
}

export type InvoiceStatus = 'Submitted' | 'Matched' | 'Exception' | 'Paid';

export interface Invoice {
  id: string; // e.g., INV-6001
  poId: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  invoicedItems: { productId: string; quantity: number; unitPrice: number }[];
}
