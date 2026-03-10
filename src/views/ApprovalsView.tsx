import { useProcurement } from '../context/ProcurementContext';
import { useToast } from '../context/ToastContext';

export function ApprovalsView() {
    const { state, dispatch } = useProcurement();
    const { addToast } = useToast();

    const pendingRequests = state.requisitions.filter(req => req.status === 'Pending Approval');

    const handleApprove = (id: string, req: any) => {
        dispatch({ type: 'APPROVE_REQUISITION', payload: id });
        const poId = `PO-${Math.floor(5000 + Math.random() * 4000)}`;
        dispatch({
            type: 'CREATE_PO',
            payload: {
                id: poId,
                requisitionId: id,
                date: new Date().toISOString().split('T')[0],
                items: req.items,
                totalPrice: req.totalPrice,
                status: 'Ordered',
                supplier: 'IT Network Solutions & Hardware Inc.'
            }
        });
        addToast(`✅ ${id} Approved! Purchase Order ${poId} created.`, 'success');
    };

    const handleDeny = (id: string) => {
        dispatch({ type: 'DENY_REQUISITION', payload: id });
        addToast(`${id} has been denied.`, 'warning');
    };

    return (
        <div style={{ flex: 1, minHeight: 0, padding: '2rem', overflowY: 'auto' }}>
            <h1>Manager Inbox</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review and approve high-value requisitions from your team.
            </p>

            {pendingRequests.length === 0 ? (
                <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
                    <h3>Inbox zero!</h3>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        Wszystkie zgłoszenia zostały rozpatrzone. Nowe wnioski pojawią się tutaj automatycznie, gdy pracownik złoży zamówienie wymagające akceptacji.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {pendingRequests.map((req) => (
                        <div key={req.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ margin: 0 }}>Review {req.id}</h3>
                                        {req.isNonCatalog && (
                                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(245,158,11,0.2)', color: 'var(--warning-color)', fontWeight: 600 }}>NON-CATALOG</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        Requested on {req.date} · MPK: {req.mpk} · GL: {req.glAccount}
                                    </p>
                                </div>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>${req.totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Items summary */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {req.items.map(item => (
                                        <li key={item.id} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{item.quantity}× {item.name}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {req.justification && (
                                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.875rem' }}>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Justification: </strong>{req.justification}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={() => handleDeny(req.id)}>
                                    Deny Request
                                </button>
                                <button className="btn btn-primary" onClick={() => handleApprove(req.id, req)}>
                                    Approve &amp; Convert to PO
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
