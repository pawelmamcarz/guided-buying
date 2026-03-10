import { useProcurement } from '../context/ProcurementContext';
import { useToast } from '../context/ToastContext';

export function SupplierPortalView() {
    const { state, dispatch } = useProcurement();
    const { addToast } = useToast();

    const handleConfirmOrder = (poId: string) => {
        const ocId = `OC-${Math.floor(8000 + Math.random() * 1000)}`;
        dispatch({
            type: 'SUBMIT_ORDER_CONFIRMATION',
            payload: { id: ocId, poId, date: new Date().toISOString().split('T')[0], status: 'Accept' }
        });
        addToast(`Order Confirmation ${ocId} sent for ${poId}`, 'success');
    };

    const handleShipOrder = (poId: string, poItems: any[]) => {
        const asnId = `ASN-${Math.floor(7000 + Math.random() * 1000)}`;
        const tracking = `TRK-${Math.floor(Math.random() * 999999)}`;
        dispatch({
            type: 'SUBMIT_SHIP_NOTICE',
            payload: {
                id: asnId, poId,
                date: new Date().toISOString().split('T')[0],
                trackingNumber: tracking,
                shippedItems: poItems.map(item => ({ productId: item.id, quantity: item.quantity }))
            }
        });
        addToast(`ASN ${asnId} sent — Tracking: ${tracking}`, 'info');
    };

    const handleCreateInvoice = (poId: string, poTotalPrice: number, poItems: any[]) => {
        const amountStr = window.prompt('Enter Invoice Amount (USD):', poTotalPrice.toString());
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) return;

        const invId = `INV-${Math.floor(6000 + Math.random() * 1000)}`;

        // Determine match outcome for toast
        const hasGR = state.goodsReceipts.some(gr => gr.poId === poId);
        const willMatch = Math.abs(amount - poTotalPrice) < 0.01 && hasGR;

        dispatch({
            type: 'SUBMIT_INVOICE',
            payload: {
                id: invId, poId,
                date: new Date().toISOString().split('T')[0],
                amount,
                status: 'Submitted',
                invoicedItems: poItems.map(item => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
            }
        });

        if (willMatch) {
            addToast(`3-Way Match OK — Invoice ${invId} Matched! ✅`, 'success');
        } else {
            const reason = !hasGR ? 'No Goods Receipt found.' : 'Amount mismatch.';
            addToast(`Invoice Exception: ${reason} ${invId} flagged for review.`, 'warning');
        }
    };

    const pendingPOs = state.purchaseOrders.filter(po => po.status === 'Ordered');
    const confirmedPOs = state.purchaseOrders.filter(po => po.status === 'Confirmed');
    const invoiceablePOs = state.purchaseOrders.filter(po => po.status === 'Shipped' || po.status === 'Received');
    const allEmpty = pendingPOs.length === 0 && confirmedPOs.length === 0 && invoiceablePOs.length === 0;

    return (
        <div style={{ flex: 1, minHeight: 0, padding: '2rem', overflowY: 'auto' }}>
            <h1>Supplier Portal</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Simulated Ariba Network view for supplier interaction (Order Confirmations, ASNs &amp; Invoicing).
            </p>

            {allEmpty ? (
                <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏭</div>
                    <h3>Brak oczekujących zamówień</h3>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        Nowe Purchase Orders pojawią się tutaj automatycznie po zatwierdzeniu przez managera w zakładce <strong>Approvals</strong>.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* New Orders */}
                    <div>
                        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📥</span> New Orders
                            {pendingPOs.length > 0 && <span style={{ background: 'var(--primary-color)', color: 'white', padding: '1px 7px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{pendingPOs.length}</span>}
                        </h3>
                        {pendingPOs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No new orders pending confirmation.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {pendingPOs.map(po => (
                                    <div key={po.id} className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(99,102,241,0.3)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontWeight: 700 }}>{po.id}</span>
                                            <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>${po.totalPrice.toFixed(2)}</span>
                                        </div>
                                        <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '1.25rem' }}>
                                            {po.items.map(i => <li key={i.id}>{i.quantity}× {i.name}</li>)}
                                        </ul>
                                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleConfirmOrder(po.id)}>
                                            Send Order Confirmation
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ready for Shipment */}
                    <div>
                        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📦</span> Ready for Shipment
                            {confirmedPOs.length > 0 && <span style={{ background: 'var(--success-color)', color: 'white', padding: '1px 7px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{confirmedPOs.length}</span>}
                        </h3>
                        {confirmedPOs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No orders awaiting shipment.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {confirmedPOs.map(po => (
                                    <div key={po.id} className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(16,185,129,0.3)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontWeight: 700 }}>{po.id}</span>
                                            <span style={{ color: 'var(--success-color)', fontSize: '0.875rem', fontWeight: 600 }}>✓ Confirmed</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{po.items.length} item(s) · ${po.totalPrice.toFixed(2)}</p>
                                        <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--success-color)', color: 'var(--success-color)' }} onClick={() => handleShipOrder(po.id, po.items)}>
                                            🚚 Create Advance Ship Notice (ASN)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ready for Invoicing */}
                    <div>
                        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🧾</span> Ready for Invoicing
                            {invoiceablePOs.length > 0 && <span style={{ background: 'var(--accent-color)', color: 'white', padding: '1px 7px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{invoiceablePOs.length}</span>}
                        </h3>
                        {invoiceablePOs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No orders to invoice yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {invoiceablePOs.map(po => {
                                    const relatedInvoice = state.invoices.find(inv => inv.poId === po.id);
                                    const hasGR = state.goodsReceipts.some(gr => gr.poId === po.id);
                                    return (
                                        <div key={po.id} className="glass-panel" style={{
                                            padding: '1.25rem',
                                            borderColor: relatedInvoice?.status === 'Exception' ? 'rgba(239,68,68,0.4)'
                                                : relatedInvoice?.status === 'Matched' ? 'rgba(16,185,129,0.4)'
                                                    : 'rgba(14,165,233,0.3)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 700 }}>{po.id}</span>
                                                <span>${po.totalPrice.toFixed(2)}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    padding: '0.15rem 0.5rem', borderRadius: '999px',
                                                    background: po.status === 'Received' ? 'rgba(16,185,129,0.15)' : 'rgba(14,165,233,0.15)',
                                                    color: po.status === 'Received' ? 'var(--success-color)' : 'var(--accent-color)',
                                                    fontWeight: 600
                                                }}>
                                                    {po.status}
                                                </span>
                                                {hasGR && <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(16,185,129,0.15)', color: 'var(--success-color)', fontWeight: 600, fontSize: '0.75rem' }}>✓ GR Received</span>}
                                            </div>
                                            {relatedInvoice ? (
                                                <div style={{
                                                    padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                                                    textAlign: 'center',
                                                    background: relatedInvoice.status === 'Matched' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                    color: relatedInvoice.status === 'Matched' ? 'var(--success-color)' : 'var(--danger-color)',
                                                    border: `1px solid ${relatedInvoice.status === 'Matched' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                                                }}>
                                                    {relatedInvoice.status === 'Matched' ? '✅' : '⚠️'} {relatedInvoice.id} — {relatedInvoice.status}
                                                    {relatedInvoice.status === 'Exception' && (
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                                                            {!hasGR ? 'Missing Goods Receipt' : 'Amount mismatch with PO'}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                                                    onClick={() => handleCreateInvoice(po.id, po.totalPrice, po.items)}>
                                                    Create Electronic Invoice
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
