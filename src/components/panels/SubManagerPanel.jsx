import React, { useState } from 'react';
import { 
    MOCK_BONDS, MOCK_PROFILES, MOCK_DEALS, DEFAULT_VISIBILITY, 
    Badge, statusColor, kycColor, Avatar, Card, SectionTitle, StatCard, Table 
} from './Shared';

export default function SubManagerPanel({ subManagerId, profiles = [], bonds = [], deals = [], activeNav, visibility }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (activeNav) {
            const tabMap = {
                'mgr-dashboard': 'dashboard',
                'mgr-bonds': 'bonds',
                'mgr-team': 'clients',
            };
            const mappedTab = tabMap[activeNav];
            if (mappedTab) setActiveTab(mappedTab);
        }
    }, [activeNav]);

    const vis = visibility['sub-manager'];
    const me = profiles.find(p => p.id === subManagerId) || {};
    const myClients = profiles.filter(p => p.role === 'client' && p.sub_manager_id === subManagerId);
    const myManager = profiles.find(p => p.id === me.manager_id);
    const myDeals = deals.filter(d => myClients.some(c => c.id === d.profile_id));

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'bonds', label: '📄 Bonds' },
        { id: 'clients', label: '👥 My Clients' },
    ];

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", color: '#1e293b' }}>
            {/* Manager Header */}
            {myManager && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '10px 16px', marginBottom: 20, fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}>Reporting to:</span>
                    <Avatar name={myManager.full_name} size={24} />
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{myManager.full_name}</span>
                    <span style={{ color: '#94a3b8' }}>· Senior Manager</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#f1f5f9', borderRadius: 14, padding: 5, flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        flex: 1, minWidth: 100, padding: '10px 12px', border: 'none', borderRadius: 10, cursor: 'pointer',
                        fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                        background: activeTab === t.id ? '#fff' : 'transparent',
                        color: activeTab === t.id ? '#1e293b' : '#64748b',
                        boxShadow: activeTab === t.id ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                    }}>{t.label}</button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18, marginBottom: 24 }}>
                        <StatCard gold label="Active Clients" value={myClients.length} sub="Under your care" />
                        <StatCard label="Total Deals" value={myDeals.length} sub="All time" />
                        <StatCard gold label="Managed AUM" value={`₹${(myClients.reduce((s, c) => s + (c.total_invested || 0), 0) / 1000).toFixed(0)}K`} sub="Portfolio value" />
                    </div>
                    <Card>
                        <SectionTitle>Assigned Clients</SectionTitle>
                        <Table
                            headers={['Name', 'Mobile', 'KYC', 'Invested', 'Deals']}
                            rows={myClients.map(c => [
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={c.full_name} size={28} /><span style={{ fontWeight: 600 }}>{c.full_name}</span></div>,
                                c.mobile,
                                <Badge color={kycColor(c.kyc_status)}>{c.kyc_status}</Badge>,
                                <span style={{ fontWeight: 700 }}>₹{((c.total_invested || 0) / 1000).toFixed(0)}K</span>,
                                <span style={{ fontWeight: 600 }}>{deals.filter(d => d.profile_id === c.id).length}</span>,
                            ])}
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'bonds' && (
                <div>
                    <SectionTitle sub="Inventory available for client allocation">Restricted Inventory View</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                        {bonds.map(bond => (
                            <Card key={bond.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    {vis.bond_name ? <div style={{ fontWeight: 800, fontSize: 14 }}>{bond.name}</div> : <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8' }}>Asset #{bond.id.slice(0, 4)}</div>}
                                    <Badge color="gold">{bond.rating}</Badge>
                                </div>
                                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, fontSize: 12 }}>
                                    {vis.yield && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Yield</span><strong>{bond.yield_rate}%</strong></div>}
                                    {vis.maturity && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Maturity</span><strong>{bond.maturity_date}</strong></div>}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'clients' && (
                <div>
                    <SectionTitle>Portfolio Oversight</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                        {myClients.map(c => (
                            <Card key={c.id} gold>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <Avatar name={c.full_name} size={44} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: 14 }}>{c.full_name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.skill_id}</div>
                                    </div>
                                    <Badge color={kycColor(c.kyc_status)}>{c.kyc_status}</Badge>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748b' }}>Investment Value</span>
                                    <strong style={{ color: '#059669' }}>₹{((c.total_invested || 0) / 1000).toFixed(0)}K</strong>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
