import React, { useState } from 'react';
import { DEFAULT_VISIBILITY } from './panels/Shared';
import AdminPanel from './panels/AdminPanel';
import ManagerPanel from './panels/ManagerPanel';
import SubManagerPanel from './panels/SubManagerPanel';
import ClientPanel from './panels/ClientPanel';

export { AdminPanel, ManagerPanel, SubManagerPanel, ClientPanel };

// ════════════════════════════════════════════
// DEMO WRAPPER — preview all panels
// ════════════════════════════════════════════
export default function RolePanelsDemo() {
    const [activeRole, setActiveRole] = useState('admin');
    const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);

    const roles = [
        { id: 'admin', label: '🔐 Master Admin', color: '#b45309', bg: 'rgba(255,215,0,0.12)' },
        { id: 'manager', label: '📊 Manager', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
        { id: 'sub-manager', label: '🤝 Sub-Manager', color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
        { id: 'client', label: '👤 Client', color: '#7c3aed', bg: 'rgba(107,33,168,0.1)' },
    ];

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg,#dff0fb 0%,#f0f9ff 100%)', padding: 32 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,#ffd700,#ffaa00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BondVault</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>Role Panel Preview</div>
                </div>

                {/* Role Switcher */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                    {roles.map(r => (
                        <button key={r.id} onClick={() => setActiveRole(r.id)} style={{
                            padding: '10px 22px', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                            background: activeRole === r.id ? r.bg : '#fff',
                            color: activeRole === r.id ? r.color : '#64748b',
                            boxShadow: activeRole === r.id ? `0 0 0 2px ${r.color}40` : '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'all 0.2s',
                            transform: activeRole === r.id ? 'translateY(-2px)' : '',
                        }}>{r.label}</button>
                    ))}
                </div>

                {/* Panel */}
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1.5px solid rgba(255,215,0,0.25)', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
                    {activeRole === 'admin' && <AdminPanel visibility={visibility} />}
                    {activeRole === 'manager' && <ManagerPanel visibility={visibility} />}
                    {activeRole === 'sub-manager' && <SubManagerPanel visibility={visibility} />}
                    {activeRole === 'client' && <ClientPanel visibility={visibility} />}
                </div>
            </div>
        </div>
    );
}