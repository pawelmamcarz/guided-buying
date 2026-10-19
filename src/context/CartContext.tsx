import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { calculateCartState } from '../logic/cartRules';
import type { CartState } from '../logic/cartRules';

type CartAction =
    | { type: 'ADD_ITEM'; payload: Product }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' };

interface CartContextType {
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    let newItems: CartItem[];

    switch (action.type) {
        case 'ADD_ITEM':
            const existingItem = state.items.find(i => i.id === action.payload.id);
            if (existingItem) {
                newItems = state.items.map(i =>
                    i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                newItems = [...state.items, { ...action.payload, quantity: 1 }];
            }
            break;

        case 'REMOVE_ITEM':
            // Don't allow removing forced bundles manually
            const isForced = (state.items.find(i => i.id === action.payload) as any)?._isForcedBundle;
            if (isForced) return state; // Ignore removal

            newItems = state.items.filter(i => i.id !== action.payload);
            break;

        case 'UPDATE_QUANTITY':
            if (action.payload.quantity <= 0) {
                newItems = state.items.filter(i => i.id !== action.payload.id);
            } else {
                newItems = state.items.map(i =>
                    i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
                );
            }
            break;

        case 'CLEAR_CART':
            newItems = [];
            break;

        default:
            return state;
    }

    return calculateCartState(newItems);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        total: 0,
        deliveryDays: 0,
        requiresManagerApproval: false,
        errors: [],
        warnings: []
    });

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
