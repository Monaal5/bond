import React from 'react';

// ─────────────────────────────────────────────
// MOCK DATA (replace with real Supabase calls)
// ─────────────────────────────────────────────
export const MOCK_BONDS = [
    { id: '1', name: 'Govt Securities 2031', issuer: 'Govt of India', type: 'Government Bond', rating: 'AAA', yield_rate: 7.25, maturity_date: '2031-06-30', payout: 'Semi-Annual', face_value: 10000, min_investment: 10000, guaranteed_by: 'Sovereign', status: 'active' },
    { id: '2', name: 'HDFC Infrastructure Bond', issuer: 'HDFC Ltd', type: 'Corporate Bond', rating: 'AA+', yield_rate: 8.10, maturity_date: '2028-03-31', payout: 'Annual', face_value: 5000, min_investment: 5000, guaranteed_by: 'Corporate backed', status: 'active' },
    { id: '3', name: 'Municipal Corp 2030', issuer: 'Mumbai Muni Corp', type: 'Municipal Bond', rating: 'A', yield_rate: 6.75, maturity_date: '2030-12-31', payout: 'Quarterly', face_value: 1000, min_investment: 1000, guaranteed_by: 'City guaranteed', status: 'active' },
    { id: '4', name: 'RBI Floating Rate', issuer: 'RBI', type: 'Government Bond', rating: 'AAA', yield_rate: 7.88, maturity_date: '2032-09-30', payout: 'Semi-Annual', face_value: 1000, min_investment: 1000, guaranteed_by: 'RBI backed', status: 'active' },
    { id: '5', name: 'Tata Capital NCD 2027', issuer: 'Tata Capital', type: 'Corporate Bond', rating: 'AA', yield_rate: 9.15, maturity_date: '2027-01-31', payout: 'Annual', face_value: 5000, min_investment: 5000, guaranteed_by: 'Tata Group', status: 'locked' },
    { id: '6', name: 'NHAI Infra Bond 2033', issuer: 'NHAI', type: 'PSU Bond', rating: 'AAA', yield_rate: 7.50, maturity_date: '2033-03-31', payout: 'Semi-Annual', face_value: 10000, min_investment: 10000, guaranteed_by: 'Govt PSU', status: 'active' },
];

export const MOCK_PROFILES = [
    { id: '57f74b20-1fd1-449c-b854-0768c40127fa', full_name: 'Mona Almamen', role: 'admin', mobile: '9999999999', skill_id: 'ADM-001', is_active: true, kyc_status: 'verified', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mona' },
    { id: 'm1', full_name: 'Rajesh Kumar', role: 'manager', mobile: '9876543210', skill_id: 'MGR-001', is_active: true, kyc_status: 'verified', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh' },
    { id: 'm2', full_name: 'Anita Desai', role: 'manager', mobile: '9876543211', skill_id: 'MGR-002', is_active: true, kyc_status: 'verified', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita' },
    { id: 's1', full_name: 'Vikram Singh', role: 'sub-manager', mobile: '9876543212', skill_id: 'SUB-001', is_active: true, kyc_status: 'verified', manager_id: 'm1', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
    { id: 's2', full_name: 'Priya Sharma', role: 'sub-manager', mobile: '9876543213', skill_id: 'SUB-002', is_active: true, kyc_status: 'verified', manager_id: 'm2', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { id: 'c1', full_name: 'Arjun Mehta', role: 'client', mobile: '9876543214', skill_id: 'CLI-001', is_active: true, kyc_status: 'pending', manager_id: 'm1', sub_manager_id: 's1', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
    { id: 'c2', full_name: 'Sanya Gupta', role: 'client', mobile: '9876543215', skill_id: 'CLI-002', is_active: true, kyc_status: 'unverified', manager_id: 'm2', sub_manager_id: 's2', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya' },
    { id: 'c3', full_name: 'Rohan Verma', role: 'client', mobile: '9876543216', skill_id: 'CLI-003', is_active: true, kyc_status: 'verified', manager_id: 'm1', sub_manager_id: 's1', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
];

export const MOCK_DEALS = [
    { id: 'd1', profile_id: 'c1', bond_id: '1', amount: 100000, status: 'done', created_at: '2024-03-15' },
    { id: 'd2', profile_id: 'c1', bond_id: '2', amount: 50000, status: 'done', created_at: '2024-04-01' },
    { id: 'd3', profile_id: 'c2', bond_id: '4', amount: 75000, status: 'pending', created_at: '2024-05-10' },
    { id: 'd4', profile_id: 'c3', bond_id: '1', amount: 200000, status: 'done', created_at: '2024-02-20' },
    { id: 'd5', profile_id: 'c4', bond_id: '3', amount: 50000, status: 'failed', created_at: '2024-04-25' },
];

// Default column visibility per role
export const DEFAULT_VISIBILITY = {
    manager: { bond_name: true, rating: true, yield: true, maturity: true, payout: true, face_value: true, portfolio: true, documents: true },
    'sub-manager': { bond_name: true, rating: true, yield: true, maturity: false, payout: true, face_value: false, portfolio: true, documents: false },
    client: { bond_name: true, rating: true, yield: true, maturity: true, payout: true, face_value: false, portfolio: true, documents: true },
};

export const COL_LABELS = {
    bond_name: 'Bond Name', rating: 'Rating', yield: 'Yield',
    maturity: 'Maturity', payout: 'Payout', face_value: 'Face Value',
    portfolio: 'Portfolio Tab', documents: 'Documents Tab',
};

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────
export const Badge = ({ children, color = 'gray' }) => {
    const colors = {
        green: { bg: 'rgba(16,185,129,0.1)', color: '#059669' },
        red: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
        yellow: { bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
        blue: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
        gray: { bg: 'rgba(100,116,139,0.1)', color: '#475569' },
        gold: { bg: 'rgba(16,185,129,0.15)', color: '#047857' },
    };
    const s = colors[color] || colors.gray;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {children}
        </span>
    );
};

export const statusColor = (s) => ({ done: 'green', pending: 'yellow', failed: 'red', cancelled: 'gray', active: 'green', locked: 'red', draft: 'blue' }[s] || 'gray');
export const kycColor = (s) => ({ verified: 'green', pending: 'yellow', rejected: 'red' }[s] || 'gray');

export const Avatar = ({ name, src, size = 36, style = {} }) => (
    <div style={{ 
        width: size, height: size, borderRadius: size * 0.28, 
        background: src ? 'none' : 'linear-gradient(135deg,#10b981,#059669)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontWeight: 800, fontSize: size * 0.38, color: '#fff', 
        flexShrink: 0, overflow: 'hidden', ...style 
    }}>
        {src ? (
            <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
            (name || '?').charAt(0).toUpperCase()
        )}
    </div>
);

export const Card = ({ children, style = {}, gold = false }) => (
    <div style={{ background: '#fff', borderRadius: 18, padding: 24, border: gold ? '1.5px solid rgba(16,185,129,0.45)' : '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', ...style }}>
        {children}
    </div>
);

export const SectionTitle = ({ children, sub }) => (
    <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>{children}</h2>
        {sub && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{sub}</p>}
    </div>
);

export const StatCard = ({ label, value, sub, subColor = '#10b981', gold }) => (
    <Card gold={gold} style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>{label}</div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 30, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: subColor, fontWeight: 600, marginTop: 6 }}>{sub}</div>}
    </Card>
);

export const Toggle = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 23, cursor: 'pointer', flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
            position: 'absolute', inset: 0, borderRadius: 23,
            background: checked ? 'linear-gradient(135deg,#10b981,#059669)' : '#e2e8f0',
            transition: '0.25s', boxShadow: checked ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
        }}>
            <span style={{
                position: 'absolute', width: 17, height: 17, borderRadius: '50%', background: '#fff',
                top: 3, left: checked ? 22 : 3, transition: '0.25s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
        </span>
    </label>
);

export const Table = ({ headers, rows, emptyMsg = 'No data found.' }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {headers.map((h, i) => (
                        <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0
                    ? <tr><td colSpan={headers.length} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>{emptyMsg}</td></tr>
                    : rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {row.map((cell, j) => (
                                <td key={j} style={{ padding: '13px 14px', fontSize: 13, color: '#334155', verticalAlign: 'middle' }}>{cell}</td>
                            ))}
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
);
