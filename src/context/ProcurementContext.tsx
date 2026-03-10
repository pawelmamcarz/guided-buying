import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
    Requisition,
    PurchaseOrder,
    GoodsReceipt,
    OrderConfirmation,
    ShipNotice,
    Invoice
} from '../types';

interface ProcurementState {
    requisitions: Requisition[];
    purchaseOrders: PurchaseOrder[];
    goodsReceipts: GoodsReceipt[];
    orderConfirmations: OrderConfirmation[];
    shipNotices: ShipNotice[];
    invoices: Invoice[];
}

type ProcurementAction =
    | { type: 'SUBMIT_REQUISITION'; payload: Requisition }
    | { type: 'APPROVE_REQUISITION'; payload: string } // id
    | { type: 'DENY_REQUISITION'; payload: string } // id
    | { type: 'CREATE_PO'; payload: PurchaseOrder }
    | { type: 'RECEIVE_GOODS'; payload: GoodsReceipt }
    | { type: 'SUBMIT_ORDER_CONFIRMATION'; payload: OrderConfirmation }
    | { type: 'SUBMIT_SHIP_NOTICE'; payload: ShipNotice }
    | { type: 'SUBMIT_INVOICE'; payload: Invoice };

const initialState: ProcurementState = {
    requisitions: [],
    purchaseOrders: [],
    goodsReceipts: [],
    orderConfirmations: [],
    shipNotices: [],
    invoices: [],
};

function procurementReducer(state: ProcurementState, action: ProcurementAction): ProcurementState {
    switch (action.type) {
        case 'SUBMIT_REQUISITION':
            return {
                ...state,
                requisitions: [...state.requisitions, action.payload],
            };
        case 'APPROVE_REQUISITION':
            return {
                ...state,
                requisitions: state.requisitions.map((req) =>
                    req.id === action.payload ? { ...req, status: 'Approved' } : req
                ),
            };
        case 'DENY_REQUISITION':
            return {
                ...state,
                requisitions: state.requisitions.map((req) =>
                    req.id === action.payload ? { ...req, status: 'Denied' } : req
                ),
            };
        case 'CREATE_PO':
            // Also update the related requisition status to 'PO Created'
            return {
                ...state,
                purchaseOrders: [...state.purchaseOrders, action.payload],
                requisitions: state.requisitions.map((req) =>
                    req.id === action.payload.requisitionId ? { ...req, status: 'PO Created' } : req
                )
            };
        case 'RECEIVE_GOODS':
            // Update PO status -> Partially Received or Received based on quantities (simplified to Received for now)
            const poToReceive = state.purchaseOrders.find(po => po.id === action.payload.poId);
            return {
                ...state,
                goodsReceipts: [...state.goodsReceipts, action.payload],
                purchaseOrders: state.purchaseOrders.map((po) =>
                    po.id === action.payload.poId ? { ...po, status: 'Received' } : po
                ),
                requisitions: state.requisitions.map((req) =>
                    poToReceive && req.id === poToReceive.requisitionId ? { ...req, status: 'Received' } : req
                )
            };
        case 'SUBMIT_ORDER_CONFIRMATION':
            return {
                ...state,
                orderConfirmations: [...state.orderConfirmations, action.payload],
                purchaseOrders: state.purchaseOrders.map((po) =>
                    po.id === action.payload.poId ? { ...po, status: 'Confirmed' } : po
                )
            };
        case 'SUBMIT_SHIP_NOTICE':
            return {
                ...state,
                shipNotices: [...state.shipNotices, action.payload],
                purchaseOrders: state.purchaseOrders.map((po) =>
                    po.id === action.payload.poId ? { ...po, status: 'Shipped' } : po
                )
            }
        case 'SUBMIT_INVOICE':
            // 3-Way Match Prototype Logic:
            // 1. PO exists
            // 2. Invoice Amount matches PO Amount
            // 3. Goods Receipt exists (Items received)
            const poToInvoice = state.purchaseOrders.find(p => p.id === action.payload.poId);
            const hasGoodsReceipt = state.goodsReceipts.some(gr => gr.poId === action.payload.poId);

            const isMatched = poToInvoice &&
                poToInvoice.totalPrice === action.payload.amount &&
                hasGoodsReceipt;

            const newInvoice = {
                ...action.payload,
                status: isMatched ? 'Matched' as const : 'Exception' as const
            };

            return {
                ...state,
                invoices: [...state.invoices, newInvoice],
                purchaseOrders: state.purchaseOrders.map((p) =>
                    p.id === action.payload.poId && isMatched ? { ...p, status: 'Invoiced' } : p
                )
            }
        default:
            return state;
    }
}

interface ProcurementContextType {
    state: ProcurementState;
    dispatch: React.Dispatch<ProcurementAction>;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(procurementReducer, initialState);

    return (
        <ProcurementContext.Provider value={{ state, dispatch }}>
            {children}
        </ProcurementContext.Provider>
    );
};

export const useProcurement = () => {
    const context = useContext(ProcurementContext);
    if (context === undefined) {
        throw new Error('useProcurement must be used within a ProcurementProvider');
    }
    return context;
};
