import { useState, useEffect } from 'react';
import '../App.css';
import { CATALOG } from '../data/catalog';
import { useCart } from '../context/CartContext';
import { useProcurement } from '../context/ProcurementContext';
import { useToast } from '../context/ToastContext';
import type { Product, Category } from '../types';

export function GuidedBuyingView() {
    const [cartOpen, setCartOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Accounting state
    const [mpk, setMpk] = useState('IT-100');
    const [glAccount, setGlAccount] = useState('400-IT-Hardware');
    const [justification, setJustification] = useState('');

    // Non-Catalog Form State
    const [isNonCatalogOpen, setIsNonCatalogOpen] = useState(false);
    const [ncName, setNcName] = useState('');
    const [ncDesc, setNcDesc] = useState('');
    const [ncPrice, setNcPrice] = useState(0);
    const [ncCategory, setNcCategory] = useState<Category>('Office Supplies');
    const [ncQty, setNcQty] = useState(1);

    const { state: cartState, dispatch: cartDispatch } = useCart();
    const { dispatch: procDispatch } = useProcurement();
    const { addToast } = useToast();

    const filteredCatalog = CATALOG
        .filter(p => !p.id.startsWith('fee-'))
        .filter(p => activeCategory === 'All' || p.category === activeCategory)
        .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleAddToCart = (product: Product) => {
        cartDispatch({ type: 'ADD_ITEM', payload: product });
    };

    const handleUpdateQty = (id: string, newQty: number) => {
        cartDispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQty } });
    };

    const handleRemove = (id: string) => {
        cartDispatch({ type: 'REMOVE_ITEM', payload: id });
    };

    // Auto-suggest GL Account based on most expensive item
    useEffect(() => {
        if (cartState.items.length > 0) {
            const mostExpensive = [...cartState.items].sort((a, b) => b.price - a.price)[0];
            if (mostExpensive.category === 'Software') {
                setGlAccount('420-Software-Licenses');
            } else if (mostExpensive.category === 'Office Supplies') {
                setGlAccount('430-Office-Materials');
            } else {
                setGlAccount('400-IT-Hardware');
            }
        }
    }, [cartState.items]);

    const toggleCheckout = () => {
        setIsCheckingOut(true);
        setCartOpen(false);
    };

    const handleAddNonCatalog = () => {
        if (!ncName || ncPrice <= 0 || ncQty <= 0) {
            alert("Please fill out name, valid price, and quantity.");
            return;
        }

        const customProduct: Product = {
            id: `nc-${Math.random().toString(36).substr(2, 9)}`,
            name: `[ZAPYTANIE OFERTOWE] ${ncName}`,
            description: ncDesc || 'Niestandardowe zamówienie spoza katalogu (Non-Catalog).',
            price: ncPrice,
            category: ncCategory,
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Generic box icon
            deliveryDays: 14, // Non-catalog takes longer
            weightKg: 1,
            requiresApproval: true // Always require approval for non-catalog
        };

        // Add to cart with specific quantity
        handleAddToCart(customProduct);
        if (ncQty > 1) {
            handleUpdateQty(customProduct.id, ncQty);
        }

        setIsNonCatalogOpen(false);
        setNcName('');
        setNcDesc('');
        setNcPrice(0);
        setNcQty(1);
        setCartOpen(true);
    };

    return (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Sidebar Navigation */}
            <aside className="app-sidebar" style={{ borderRight: '1px solid var(--surface-border)', width: '250px' }}>
                <div className="sidebar-title">Categories</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['All', 'Computers', 'Peripherals', 'Software', 'Office Supplies'].map(cat => (
                        <li key={cat}>
                            <button
                                className={`btn btn-outline ${activeCategory === cat ? 'active' : ''}`}
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    border: 'none',
                                    background: activeCategory === cat ? 'var(--surface-hover)' : 'transparent',
                                    color: activeCategory === cat ? 'var(--primary-color)' : 'inherit'
                                }}
                                onClick={() => setActiveCategory(cat as any)}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--surface-border)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Can't find what you are looking for?
                    </p>
                    <button
                        className="btn btn-outline"
                        style={{ width: '100%', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                        onClick={() => setIsNonCatalogOpen(true)}
                    >
                        + Non-Catalog Request
                    </button>
                </div>
            </aside>

            {/* Main Catalog View */}
            <main className="app-main" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div className="catalog-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Corporate Hardware Catalog</h1>
                        <p>Select items for your request. Business rules apply automatically.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                style={{
                                    padding: '0.625rem 1rem 0.625rem 2.5rem',
                                    background: 'var(--surface-color)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    width: '220px',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setCartOpen(true)}
                            style={{ position: 'relative' }}
                        >
                            View Cart ({cartState.items.reduce((acc, item) => acc + item.quantity, 0)})
                            {cartState.errors.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: -5, right: -5, width: 12, height: 12,
                                    background: 'var(--danger-color)', borderRadius: '50%'
                                }}></span>
                            )}
                        </button>
                    </div>
                </div>

                {filteredCatalog.length === 0 && (
                    <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3>Brak wyników dla „{searchQuery}"</h3>
                        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Spróbuj innego zapytania lub wyczyść filtry.</p>
                        <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>
                            Wyczyść filtry
                        </button>
                    </div>
                )}

                <div className="catalog-grid">
                    {filteredCatalog.map((product, idx) => (
                        <div
                            key={product.id}
                            className="glass-panel animate-fade-in"
                            style={{ animationDelay: `${idx * 0.05}s`, display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ height: '180px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', position: 'relative' }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {product.requiresApproval && <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--warning-color)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, color: '#000' }}>Manager Approval</span>}
                            </div>
                            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', marginBottom: '0.25rem', fontWeight: 600 }}>
                                    {product.category}
                                </div>
                                <h3>{product.name}</h3>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1rem', flex: 1 }}>
                                    {product.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Drawer */}
            {cartOpen && (
                <>
                    <div className="cart-drawer-backdrop animate-fade-in" onClick={() => setCartOpen(false)}></div>
                    <div className="cart-drawer animate-slide-right" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>Your Request</h2>
                            <button className="btn btn-outline" onClick={() => setCartOpen(false)}>Close</button>
                        </div>

                        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                            {cartState.errors.length > 0 && (
                                <div className="glass-panel animate-pop" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <h4 style={{ color: 'var(--danger-color)', marginBottom: '0.5rem' }}>Checkout Blocked</h4>
                                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                                        {cartState.errors.map((e, i) => <li key={i}>{e}</li>)}
                                    </ul>
                                </div>
                            )}

                            {cartState.warnings.length > 0 && (
                                <div className="glass-panel animate-pop" style={{ borderColor: 'var(--warning-color)', padding: '1rem', marginBottom: '1rem', background: 'rgba(245, 158, 11, 0.1)' }}>
                                    <h4 style={{ color: 'var(--warning-color)', marginBottom: '0.5rem' }}>Pro Tips / Alerts</h4>
                                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                                        {cartState.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}

                            {cartState.items.length === 0 ? (
                                <p>Cart is currently empty. Add items from the catalog.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cartState.items.map(item => {
                                        const isForced = (item as any)._isForcedBundle;
                                        return (
                                            <div key={item.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                                                <img src={item.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                                {!isForced && (
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, padding: 0, borderRadius: '50%', fontSize: '0.75rem' }}
                                                        onClick={() => handleRemove(item.id)}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</span>
                                                        {isForced ? (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', background: 'rgba(14, 165, 233, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                                Required Bundle
                                                            </span>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', borderRadius: '4px', padding: '0.25rem' }}>
                                                                <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0 0.5rem' }} onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>-</button>
                                                                <span style={{ fontSize: '0.875rem', minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                                                                <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0 0.5rem' }} onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Checkout Action Bar */}
                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', background: 'var(--bg-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span>
                                <span>${cartState.subtotal.toFixed(2)}</span>
                            </div>
                            {cartState.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--success-color)' }}>
                                    <span>Discounts Applied</span>
                                    <span>-${cartState.discount.toFixed(2)}</span>
                                </div>
                            )}
                            {cartState.shippingFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--warning-color)' }}>
                                    <span>Shipping & Logistics</span>
                                    <span>+${cartState.shippingFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
                                <span>Total</span>
                                <span>${cartState.total.toFixed(2)}</span>
                            </div>
                            <button
                                className={`btn ${cartState.errors.length > 0 ? 'btn-danger' : 'btn-primary'}`}
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                                disabled={cartState.errors.length > 0 || cartState.items.length === 0}
                                onClick={toggleCheckout}
                            >
                                {cartState.errors.length > 0 ? 'Resolve Errors to Checkout' : 'Proceed to Checkout'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Checkout Modal / Finalization */}
            {isCheckingOut && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
                    display: 'grid', placeItems: 'center', zIndex: 100
                }}>
                    <div className="glass-panel animate-pop" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Finalize Request</h2>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Justification (Optional)</label>
                                <textarea
                                    value={justification}
                                    onChange={e => setJustification(e.target.value)}
                                    placeholder="Why do you need these items?"
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px', minHeight: '60px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>MPK (Cost Center)</label>
                                <input
                                    type="text"
                                    value={mpk}
                                    onChange={e => setMpk(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>GL Account (Recommended based on cart)</label>
                                <input
                                    type="text"
                                    value={glAccount}
                                    onChange={e => setGlAccount(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'var(--accent-color)', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Estimated Delivery</span>
                                <strong>{cartState.deliveryDays} Business Days</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Manager Approval</span>
                                <strong style={{ color: cartState.requiresManagerApproval ? 'var(--warning-color)' : 'var(--success-color)' }}>
                                    {cartState.requiresManagerApproval ? 'Required' : 'Auto-Approved'}
                                </strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', fontSize: '1.25rem', fontWeight: 700 }}>
                                <span>Total Budget Allocation</span>
                                <span>${cartState.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setIsCheckingOut(false)}>Go Back</button>
                            <button className="btn btn-primary" onClick={() => {

                                const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
                                const needsApproval = cartState.requiresManagerApproval;

                                // --- SUBMIT WORKFLOW TO ARIBA PROCUREMENT ---
                                procDispatch({
                                    type: 'SUBMIT_REQUISITION',
                                    payload: {
                                        id: reqId,
                                        date: new Date().toISOString().split('T')[0],
                                        items: [...cartState.items],
                                        totalPrice: cartState.total,
                                        mpk,
                                        glAccount,
                                        requiresManagerApproval: needsApproval,
                                        status: needsApproval ? 'Pending Approval' : 'Approved',
                                        justification
                                    }
                                });

                                cartDispatch({ type: 'CLEAR_CART' });
                                setIsCheckingOut(false);
                                setJustification('');

                                if (needsApproval) {
                                    addToast(`${reqId} submitted! Awaiting Manager Approval.`, 'warning');
                                } else {
                                    addToast(`${reqId} submitted and auto-approved!`, 'success');
                                }
                            }}>
                                Submit Requisition
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Non-Catalog Request Modal */}
            {isNonCatalogOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
                    display: 'grid', placeItems: 'center', zIndex: 100
                }}>
                    <div className="glass-panel animate-pop" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                            Request Non-Catalog Item
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Use this form to request items or services not available in the standard corporate catalog. Non-catalog items require Manager Approval and take longer to source.
                        </p>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Item Name / Title *</label>
                                <input
                                    type="text"
                                    value={ncName}
                                    onChange={e => setNcName(e.target.value)}
                                    placeholder="e.g., Specialized ergonomic chair"
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Detailed Specification / Justification</label>
                                <textarea
                                    value={ncDesc}
                                    onChange={e => setNcDesc(e.target.value)}
                                    placeholder="Provide links, vendor names, or exact specs..."
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Estimated Price (USD) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={ncPrice}
                                        onChange={e => setNcPrice(Number(e.target.value))}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px' }}
                                    />
                                </div>
                                <div style={{ width: '100px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Qty *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={ncQty}
                                        onChange={e => setNcQty(Number(e.target.value))}
                                        style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Material Group / Category</label>
                                <select
                                    value={ncCategory}
                                    onChange={e => setNcCategory(e.target.value as Category)}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px' }}
                                >
                                    <option value="Office Supplies">Office Supplies</option>
                                    <option value="Computers">Computers & Hardware</option>
                                    <option value="Peripherals">Peripherals</option>
                                    <option value="Software">Software & Subscriptions</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setIsNonCatalogOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddNonCatalog}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
