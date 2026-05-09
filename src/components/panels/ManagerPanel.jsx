import React, { useState } from 'react';
import { 
    MOCK_BONDS, MOCK_PROFILES, MOCK_DEALS, DEFAULT_VISIBILITY, 
    Badge, statusColor, kycColor, Avatar, Card, SectionTitle, StatCard, Table 
} from './Shared';

export default function ManagerPanel({ managerId, profiles = [], bonds = [], deals = [], activeNav, visibility, fetchData }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (activeNav) {
            const tabMap = {
                'mgr-dashboard': 'dashboard',
                'mgr-bonds': 'bonds',
                'mgr-team': 'team',
                'mgr-deals': 'deals',
                'mgr-portfolio': 'portfolio'
            };
            const mappedTab = tabMap[activeNav];
            if (mappedTab) setActiveTab(mappedTab);
        }
    }, [activeNav]);

    const myClients = profiles.filter(p => p.role === 'client' && p.manager_id === managerId);
    const mySubManagers = profiles.filter(p => p.role === 'sub-manager' && p.manager_id === managerId);
    const myDeals = deals.filter(d => myClients.some(c => c.id === d.profile_id));
    const totalAUM = myClients.reduce((s, c) => s + (c.total_invested || 0), 0);
    const vis = visibility.manager;

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'bonds', label: '📄 Bonds' },
        { id: 'clients', label: '👥 My Clients' },
        { id: 'team', label: '🤝 My Team' },
    ];

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", color: '#1e293b' }}>
            {/* Top Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, marginBottom: 24 }}>
                <StatCard gold label="Team AUM" value={`₹${(totalAUM / 100000).toFixed(1)}L`} sub="Managing assets" />
                <StatCard label="Direct Clients" value={myClients.length} sub="Reporting to you" />
                <StatCard label="Sub-Managers" value={mySubManagers.length} sub="Team size" />
                <StatCard gold label="Total Deals" value={myDeals.length} sub="Across all clients" />
            </div>

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Card>
                        <SectionTitle>Top Investors</SectionTitle>
                        <Table
                            headers={['Client', 'AUM', 'KYC']}
                            rows={myClients.sort((a, b) => (b.total_invested || 0) - (a.total_invested || 0)).slice(0, 5).map(c => [
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={c.full_name} size={28} /><span style={{ fontWeight: 600 }}>{c.full_name}</span></div>,
                                <span style={{ fontWeight: 700 }}>₹{((c.total_invested || 0) / 1000).toFixed(0)}K</span>,
                                <Badge color={kycColor(c.kyc_status)}>{c.kyc_status}</Badge>
                            ])}
                        />
                    </Card>
                    <Card>
                        <SectionTitle>Recent Deals</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {myDeals.slice(0, 5).map(d => {
                                const c = profiles.find(p => p.id === d.profile_id);
                                return (
                                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                                        <Avatar name={c?.full_name} size={30} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>{c?.full_name} <span style={{ fontWeight: 400, color: '#94a3b8' }}>invested</span> ₹{(d.amount / 1000).toFixed(0)}K</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(d.created_at).toLocaleTimeString()}</div>
                                        </div>
                                        <Badge color={statusColor(d.status)}>{d.status}</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'clients' && (
                <div>
                    <SectionTitle sub="Detailed overview of your client portfolio">Portfolio Management</SectionTitle>
                    <Card>
                        <Table
                            headers={['Client', 'Skill ID', 'Mobile', 'KYC Status', 'Total Invested', 'Status']}
                            rows={myClients.map(c => [
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={c.full_name} size={32} /><strong>{c.full_name}</strong></div>,
                                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.skill_id}</span>,
                                c.mobile,
                                <Badge color={kycColor(c.kyc_status)}>{c.kyc_status}</Badge>,
                                <span style={{ fontWeight: 800 }}>₹{((c.total_invested || 0) / 1000).toFixed(0)}K</span>,
                                <Badge color={c.is_active ? 'green' : 'red'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                            ])}
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'team' && (
                <div>
                    <SectionTitle sub="Sub-managers reporting to you">Team Oversight</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                        {mySubManagers.map(sm => {
                            const smClients = profiles.filter(p => p.role === 'client' && p.sub_manager_id === sm.id);
                            return (
                                <Card key={sm.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <Avatar name={sm.full_name} size={40} />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{sm.full_name}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{sm.skill_id}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}><Badge color="blue">Sub-Manager</Badge></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                                            <div style={{ fontWeight: 800, fontSize: 20 }}>{smClients.length}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Clients</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                                            <div style={{ fontWeight: 800, fontSize: 20 }}>₹{(smClients.reduce((s, c) => s + (c.total_invested || 0), 0) / 1000).toFixed(0)}K</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>AUM</div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'bonds' && (
                <div>
                    <SectionTitle sub="Listed bonds available for your clients">Inventory</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                        {bonds.map(bond => (
                            <Card key={bond.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ fontWeight: 800, fontSize: 15 }}>{bond.name}</div>
                                    <Badge color="gold">{bond.rating}</Badge>
                                </div>
                                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{bond.issuer} · {bond.type}</div>
                                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, fontSize: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>Yield Rate</span>
                                        <span style={{ fontWeight: 700, color: '#10b981' }}>{bond.yield_rate}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Min Investment</span>
                                        <span style={{ fontWeight: 700 }}>₹{bond.min_investment.toLocaleString()}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
