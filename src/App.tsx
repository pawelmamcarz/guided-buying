import { useState } from 'react';
import './App.css';
import { useProcurement } from './context/ProcurementContext';
import { GuidedBuyingView } from './views/GuidedBuyingView';
import { MyRequestsView } from './views/MyRequestsView';
import { ApprovalsView } from './views/ApprovalsView';
import { SupplierPortalView } from './views/SupplierPortalView';

type Workspace = 'Guided Buying' | 'My Requests' | 'Approvals' | 'Supplier Portal';

function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>('Guided Buying');
  const { state } = useProcurement();

  const pendingApprovalsCount = state.requisitions.filter(r => r.status === 'Pending Approval').length;

  return (
    <div className="app-container">
      {/* Universal Header with Navigation */}
      <header className="app-header" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ minWidth: '250px' }}>
          <div className="logo-icon">GB</div>
          <span style={{ fontSize: '1rem' }}>Ariba Prototype</span>
        </div>

        {/* Workspace Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
          {(['Guided Buying', 'My Requests', 'Approvals', 'Supplier Portal'] as Workspace[]).map(ws => (
            <button
              key={ws}
              onClick={() => setActiveWorkspace(ws)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeWorkspace === ws ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeWorkspace === ws ? 700 : 500,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderBottom: activeWorkspace === ws ? '3px solid var(--primary-color)' : '3px solid transparent',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {ws}
              {ws === 'Approvals' && pendingApprovalsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-10px',
                  background: 'var(--danger-color)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Placeholder for Profile/Settings to balance the header */}
        <div style={{ minWidth: '250px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-color)', display: 'grid', placeItems: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
            PM
          </div>
        </div>
      </header>

      {/* Render Active View */}
      {activeWorkspace === 'Guided Buying' && <GuidedBuyingView />}
      {activeWorkspace === 'My Requests' && <MyRequestsView />}
      {activeWorkspace === 'Approvals' && <ApprovalsView />}
      {activeWorkspace === 'Supplier Portal' && <SupplierPortalView />}

      <footer style={{
        flexShrink: 0,
        borderTop: '1px solid var(--surface-border)',
        background: 'rgba(11, 15, 25, 0.7)',
        backdropFilter: 'blur(16px)',
        padding: '0.6rem var(--spacing-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        <span>Ariba Guided Buying Prototype <strong style={{ color: 'var(--text-secondary)' }}>v1.0.0</strong></span>
        <span>© 2000–2026 Rajesh Consulting. All rights reserved.</span>
      </footer>

    </div>
  );
}

export default App;
