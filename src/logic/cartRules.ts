import type { CartItem } from '../types';
import { CATALOG } from '../data/catalog';

export interface CartState {
    items: CartItem[];
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
    deliveryDays: number;
    requiresManagerApproval: boolean;
    errors: string[];
    warnings: string[];
}

// Complex Rules Engine
export const calculateCartState = (currentItems: CartItem[]): CartState => {
    let finalItems = [...currentItems];
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresManagerApproval = false;

    // RULE 9: Wymagane usługi (Service Bundle)
    // If Software is present, automatically add Admin Fee
    const hasSoftware = finalItems.some(i => i.category === 'Software' && i.id !== 'fee-1');
    if (hasSoftware && !finalItems.some(i => i.id === 'fee-1')) {
        const feeItem = CATALOG.find(p => p.id === 'fee-1');
        if (feeItem) finalItems.push({ ...feeItem, quantity: 1, _isForcedBundle: true } as any);
    } else if (!hasSoftware) {
        finalItems = finalItems.filter(i => i.id !== 'fee-1');
    }

    // Original Rule: Forced Mouse
    const hasLaptop = finalItems.some(i => i.category === 'Computers');
    if (hasLaptop && !finalItems.some(i => i.id === 'p-3' && (i as any)._isForcedBundle)) {
        const mouse = CATALOG.find(p => p.id === 'p-3');
        if (mouse) finalItems.push({ ...mouse, quantity: 1, _isForcedBundle: true } as any);
    } else if (!hasLaptop) {
        // Only remove if it was forced
        finalItems = finalItems.filter(i => !(i.id === 'p-3' && (i as any)._isForcedBundle));
    }

    // Calculate Base Subtotal
    const subtotal = finalItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;

    // RULE 1: Minimum logistyczne (min $50)
    if (subtotal > 0 && subtotal < 50) {
        errors.push("Minimum układu logistycznego nie zostało osiągnięte ($50).");
    }

    // RULE 4: Agregowanie w paczki (Paper must be multiples of 2)
    const paper = finalItems.find(i => i.id === 'p-7');
    if (paper && paper.quantity % 2 !== 0) {
        errors.push(`Staples Copy Paper musi być zamawiany w paczkach po 2 (obecnie: ${paper.quantity}).`);
    }

    // RULE 5: BOGO 50% na Klawiatury (Keychron p-4)
    const keyboard = finalItems.find(i => i.id === 'p-4');
    if (keyboard && keyboard.quantity >= 2) {
        const pairs = Math.floor(keyboard.quantity / 2);
        // 50% off the second item in the pair
        discount += pairs * (keyboard.price * 0.5);
        warnings.push("Zastosowano Promocję: Kup 2 klawiatury, druga za 50%!");
    }

    // Quantity Discount: >= 10 Office Supplies (original rule)
    finalItems.forEach(item => {
        if (item.category === 'Office Supplies' && item.quantity >= 10) {
            discount += (item.price * item.quantity) * 0.15;
        }
    });

    // RULE 6: Manager Approval for items > $2000
    if (finalItems.some(i => i.requiresApproval)) {
        requiresManagerApproval = true;
        warnings.push("To zamówienie wymaga akceptacji Managera (przedmioty wysokiej wartości).");
    }

    // RULE 7: Limit Budżetu per Kategoria (Computers max $5000)
    const computerTotal = finalItems.filter(i => i.category === 'Computers').reduce((acc, i) => acc + (i.price * i.quantity), 0);
    if (computerTotal > 5000) {
        errors.push("Przekroczono budżet w kategorii Computers (max $5000).");
    }

    // RULE 8 & 2: Koszty Dostawy and Heavy Freight
    const totalWeight = finalItems.reduce((acc, i) => acc + (i.weightKg * i.quantity), 0);
    let shippingFee = 0;

    if (subtotal > 0) {
        if (totalWeight > 50) {
            shippingFee = 150; // Heavy freight
            warnings.push("Zamówienie zakwalifikowane jako przesyłka gabarytowa (powyżej 50kg).");
        } else if (subtotal > 500) {
            shippingFee = 0; // Free shipping
        } else {
            shippingFee = 15; // Flat rate
        }
    }

    // RULE 3: Czas dostawy (max delivery days)
    const deliveryDays = finalItems.reduce((max, i) => Math.max(max, i.deliveryDays), 0);

    // RULE 10: Limit wielkości zamówienia
    const totalItemsCount = finalItems.reduce((acc, i) => acc + i.quantity, 0);
    if (totalItemsCount > 50) {
        errors.push("Zbyt duża ilość sztuk. Pmaksymalny limit dla jednego logowania to 50 przedmiotów.");
    }

    // Original Rule: Incompatibilities
    const hasMac = finalItems.some(i => i.name.includes('MacBook'));
    const hasWinSoft = finalItems.some(i => i.name === 'Visual Studio Enterprise 2022');
    if (hasMac && hasWinSoft) {
        errors.push("Konflikt sprzętowy: Visual Studio (Windows) i MacBook.");
    }

    return {
        items: finalItems,
        subtotal,
        discount,
        shippingFee,
        total: subtotal - discount + shippingFee,
        deliveryDays,
        requiresManagerApproval,
        errors,
        warnings
    };
};
