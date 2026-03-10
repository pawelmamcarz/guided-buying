import { useProcurement } from '../context/ProcurementContext';
import { useToast } from '../context/ToastContext';
import type { Requisition, PurchaseOrder } from '../types';

// Mini stepper showing the full document lifecycle
function DocumentStepper({ req, po }: { req: Requisition; po?: PurchaseOrder }) {
    const steps = [
        { label: 'REQ', done: true, active: req.status === 'Pending Approval' || req.status === 'Draft' },
        { label: 'Approved', done: req.status !== 'Pending Approval' && req.status !== 'Draft' && req.status !== 'Denied', active: req.status === 'Approved' },
        { label: 'PO', done: !!po, active: po?.status === 'Ordered' },
        { label: 'Confirmed', done: po?.status !== undefined && po.status !== 'Ordered' && po.status !== 'Confirmed', active: po?.status === 'Confirmed' },
        { label: 'Shipped', done: po?.status === 'Received' || po?.status === 'Invoiced' || po?.status === 'Closed', active: po?.status === 'Shipped' },
        { label: 'GR', done: po?.status === 'Invoiced' || po?.status === 'Closed', active: po?.status === 'Received' },
        { label: 'Invoiced', done: po?.status === 'Closed', active: po?.status === 'Invoiced' },
    ];

    if (req.status === 'Denied') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.2)', color: 'var(--success-color)' }}>REQ</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239,68,68,0.2)', color: 'var(--danger-color)' }}>DENIED</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {steps.map((step, i) => (
                <span key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: step.active
                            ? 'rgba(99,102,241,0.3)'
                            : step.done
                                ? 'rgba(16,185,129,0.2)'
                                : 'rgba(255,255,255,0.05)',
                        color: step.active
                            ? 'var(--primary-color)'
                            : step.done
                                ? 'var(--success-color)'
                                : 'var(--text-muted)',
                        border: step.active ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                    }}>
                        {step.done && !step.active ? '✓ ' : ''}{step.label}
                    </span>
                    {i < steps.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>}
                </span>
            ))}
        </div>
    );
}

export function MyRequestsView() {
    const { state, dispatch } = useProcurement();
    const { addToast } = useToast();

    const getRelatedPO = (reqId: string) => state.purchaseOrders.find(po => po.requisitionId === reqId);

    const handleReceiveGoods = (poId: string, items: any[]) => {
        const grId = `GR-${Math.floor(1000 + Math.random() * 9000)}`;
        dispatch({
            type: 'RECEIVE_GOODS',
            payload: {
                id: grId,
                poId: poId,
                date: new Date().toISOString().split('T')[0],
                receivedItems: items.map(item => ({ productId: item.id, quantity: item.quantity }))
            }
        });
        addToast(`${grId} created — Goods received for PO ${poId}!`, 'success');
    };

    return (
        <div style={{ flex: 1, minHeight: 0, padding: '2rem', overflowY: 'auto' }}>
            <h1>My Requests</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Track your requisitions and purchase orders here.
            </p>

            {state.requisitions.length === 0 ? (
                <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
                    <h3>Nie masz żadnych zgłoszeń</h3>
                    <p style={{ marginTop: '0.5rem' }}>
                        Dodaj produkty do koszyka w widoku Guided Buying i złóż zapotrzebowanie.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {state.requisitions.map((req) => {
                        const po = getRelatedPO(req.id);

                        return (
                            <div key={req.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <h3 style={{ margin: 0 }}>{req.id}</h3>
                                            {req.isNonCatalog && (
                                                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(245,158,11,0.2)', color: 'var(--warning-color)', fontWeight: 600 }}>NON-CATALOG</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            {req.date} · {req.items.length} item(s) · ${req.totalPrice.toFixed(2)} · MPK: {req.mpk}
                                        </p>
                                        {po && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--accent-color)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                                                Linked PO: <strong>{po.id}</strong> · Supplier: {po.supplier}
                                            </p>
                                        )}
                                        <DocumentStepper req={req} po={po} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', marginLeft: '1.5rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.9rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            background: req.status === 'Approved' || req.status === 'PO Created' ? 'rgba(16,185,129,0.15)' :
                                                req.status === 'Denied' ? 'rgba(239,68,68,0.15)' :
                                                    req.status === 'Received' ? 'rgba(16,185,129,0.25)' :
                                                        req.status === 'Shipped' ? 'rgba(14,165,233,0.15)' :
                                                            'rgba(245,158,11,0.15)',
                                            color: req.status === 'Approved' || req.status === 'PO Created' || req.status === 'Received' ? 'var(--success-color)' :
                                                req.status === 'Denied' ? 'var(--danger-color)' :
                                                    req.status === 'Shipped' ? 'var(--accent-color)' :
                                                        'var(--warning-color)'
                                        }}>
                                            {req.status}
                                        </span>

                                        {po?.status === 'Shipped' && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                onClick={() => handleReceiveGoods(po.id, po.items)}
                                            >
                                                📦 Receive Goods
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
