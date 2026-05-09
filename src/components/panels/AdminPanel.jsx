import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    MOCK_BONDS, MOCK_PROFILES, MOCK_DEALS, DEFAULT_VISIBILITY, COL_LABELS,
    Badge, statusColor, kycColor, Avatar, Card, SectionTitle, StatCard, Toggle, Table 
} from './Shared';
import { analyzeDocument } from '../../lib/gemini';
import { Brain, FileCheck, ShieldCheck } from 'lucide-react';

export default function AdminPanel({ bonds = [], profiles = [], deals = [], activeNav, visibility, toggleVisibility }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [kycRequests, setKycRequests] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [dbInsights, setDbInsights] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [hierarchyPath, setHierarchyPath] = useState([]); // [{id, role, name}]

    useEffect(() => {
        if (activeNav) {
            const tabMap = {
                'admin-dashboard': 'overview',
                'admin-kyc': 'kyc_audit',
                'admin-bonds': 'bonds',
                'admin-hierarchy': 'hierarchy',
                'admin-users': 'staff',
                'admin-deals': 'kyc_audit',
                'admin-import': 'ai_insights',
                'admin-permissions': 'visibility'
            };
            const mappedTab = tabMap[activeNav];
            if (mappedTab) setActiveTab(mappedTab);
        }
    }, [activeNav]);

    useEffect(() => {
        fetchKycRequests();
    }, []);

    const fetchKycRequests = async () => {
        const { data, error } = await supabase
            .from('kyc_submissions')
            .select('*, profiles(full_name, skill_id, kyc_status)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (data) setKycRequests(data);
    };

    const handleKycAction = async (requestId, profileId, action) => {
        setIsLoading(true);
        try {
            // Update submission status
            const { error: subError } = await supabase
                .from('kyc_submissions')
                .update({ status: action === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date() })
                .eq('id', requestId);

            if (subError) throw subError;

            // Update profile status
            const { error: profError } = await supabase
                .from('profiles')
                .update({ kyc_status: action === 'approve' ? 'verified' : 'rejected' })
                .eq('id', profileId);

            if (profError) throw profError;

            alert(`KYC ${action}d successfully!`);
            fetchKycRequests();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiAnalysis = async (request) => {
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeDocument(`Document Type: ${request.doc_type}\nNotes: ${request.encrypted_notes}\nClient: ${request.profiles?.full_name}`, 'text');
            setAiAnalysis(prev => ({ ...prev, [request.id]: analysis }));
        } catch (err) {
            alert("AI Analysis failed: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateDbInsights = async () => {
        setIsAnalyzing(true);
        try {
            const dataStr = deals.map(d => `${d.profile_id},${d.amount},${d.status}`).join('\n');
            const insights = await analyzeDocument(dataStr, 'text');
            setDbInsights(insights);
        } catch (err) {
            alert("Insights generation failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const managers = profiles.filter(p => p.role === 'manager');
    const subManagers = profiles.filter(p => p.role === 'sub-manager');
    const clients = profiles.filter(p => p.role === 'client');

    const getManagerSubManagers = (mgrId) => subManagers.filter(s => s.manager_id === mgrId);
    const getSubManagerClients = (subId) => clients.filter(c => c.manager_id === subId);

    const drillDown = (user) => {
        setHierarchyPath(prev => [...prev, { id: user.id, role: user.role, name: user.full_name }]);
    };

    const resetHierarchy = () => setHierarchyPath([]);
    const goBackHierarchy = () => setHierarchyPath(prev => prev.slice(0, -1));

    const currentDrillLevel = hierarchyPath.length; // 0: Managers, 1: SubManagers, 2: Clients
    const currentParent = hierarchyPath[currentDrillLevel - 1];

    const displayUsers = currentDrillLevel === 0 ? managers : 
                         currentDrillLevel === 1 ? getManagerSubManagers(currentParent.id) :
                         getSubManagerClients(currentParent.id);

    const handleRoleChange = async (profileId, newRole) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
            if (error) throw error;
            alert(`Role updated to ${newRole} successfully!`);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserAction = async (userId, action) => {
        setIsLoading(true);
        const updates = action === 'approve' 
            ? { kyc_status: 'verified', is_active: true }
            : { kyc_status: 'rejected', is_active: false };
        
        try {
            const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (error) throw error;
            alert(`User ${action === 'approve' ? 'approved' : 'flagged'} successfully!`);
            setSelectedUser(null);
            // In a real app, you'd call a refresh function passed from props
        } catch (e) {
            console.error(e);
            alert('Failed to update user: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // toggleVisibility is now a prop from App.jsx

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'kyc_audit', label: '🛡️ KYC Audit' },
        { id: 'bonds', label: '📄 Bond Control' },
        { id: 'hierarchy', label: '🏢 Team Hierarchy' },
        { id: 'staff', label: '👥 Staff Management' },
        { id: 'ai_insights', label: '🧠 AI Insights' },
        { id: 'visibility', label: '👁 Visibility' },
    ];

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", color: '#1e293b' }}>
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#f1f5f9', borderRadius: 14, padding: 5, flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        flex: 1, minWidth: 100, padding: '10px 16px', border: 'none', borderRadius: 10, cursor: 'pointer',
                        fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                        background: activeTab === t.id ? '#fff' : 'transparent',
                        color: activeTab === t.id ? '#1e293b' : '#64748b',
                        boxShadow: activeTab === t.id ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                    }}>{t.label}</button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div>
                    <SectionTitle>Platform Survelliance</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
                        <StatCard gold label="Total AUM" value={`₹${(profiles.reduce((s, c) => s + (c.total_invested || 0), 0) / 100000).toFixed(1)}L`} sub="+12% YoY" />
                        <StatCard label="Active Bonds" value={bonds.length} sub="Listed Assets" />
                        <StatCard label="Total Clients" value={clients.length} sub="Onboarded" />
                        <StatCard gold label="KYC Pending" value={kycRequests.length} sub="Awaiting Review" subColor="#d97706" />
                    </div>

                    <Card>
                        <SectionTitle>Recent Activity</SectionTitle>
                        <Table
                            headers={['Client', 'Activity', 'Amount', 'Status', 'Time']}
                            rows={deals.slice(0, 8).map(d => {
                                const c = profiles.find(p => p.id === d.profile_id);
                                return [
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={c?.full_name} size={28} /><span style={{ fontWeight: 600 }}>{c?.full_name}</span></div>,
                                    <span style={{ fontSize: 12 }}>Bond Investment</span>,
                                    <span style={{ fontWeight: 700 }}>₹{(d.amount / 1000).toFixed(0)}K</span>,
                                    <Badge color={statusColor(d.status)}>{d.status}</Badge>,
                                    <span style={{ color: '#94a3b8', fontSize: 11 }}>{new Date(d.created_at).toLocaleTimeString()}</span>
                                ];
                            })}
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'kyc_audit' && (
                <div>
                    <SectionTitle sub="Secure verification of client identity documents">KYC Approval Pipeline</SectionTitle>
                    <Card>
                        <Table
                            headers={['Client', 'Document Type', 'AI Review', 'Submitted', 'Action']}
                            rows={kycRequests.map(r => [
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Avatar name={r.profiles?.full_name} size={32} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.profiles?.full_name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {r.profiles?.skill_id}</div>
                                    </div>
                                </div>,
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Badge color="gold">{r.doc_type}</Badge>
                                        <a href={r.doc_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View ↗</a>
                                    </div>
                                </div>,
                                <div style={{ maxWidth: 300 }}>
                                    {aiAnalysis[r.id] ? (
                                        <div style={{ fontSize: 11, color: '#475569', background: '#f1f5f9', padding: 8, borderRadius: 6, borderLeft: '3px solid #6366f1' }}>
                                            <strong>AI Summary:</strong> {aiAnalysis[r.id].slice(0, 150)}...
                                        </div>
                                    ) : (
                                        <button onClick={() => handleAiAnalysis(r)} disabled={isAnalyzing} style={{ 
                                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', 
                                            fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 
                                        }}>
                                            <Brain size={12} color="#6366f1" /> Run AI Review
                                        </button>
                                    )}
                                </div>,
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(r.created_at).toLocaleString()}</span>,
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleKycAction(r.id, r.profile_id, 'approve')} disabled={isLoading} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                                    <button onClick={() => handleKycAction(r.id, r.profile_id, 'reject')} disabled={isLoading} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                                </div>
                            ])}
                            emptyMsg="No pending KYC requests."
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'bonds' && (
                <div>
                    <SectionTitle sub="Manage listed bonds and master locks">Bond Control Center</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
                        {bonds.map(bond => (
                            <Card key={bond.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ fontWeight: 800, fontSize: 15 }}>{bond.name}</div>
                                    <Badge color={bond.is_locked ? 'red' : 'green'}>{bond.is_locked ? 'Locked' : 'Active'}</Badge>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12 }}>
                                    <div><span style={{ color: '#94a3b8' }}>Yield: </span><strong style={{ color: '#10b981' }}>{bond.yield_rate}%</strong></div>
                                    <div><span style={{ color: '#94a3b8' }}>Face Val: </span><strong>₹{bond.face_value.toLocaleString()}</strong></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>Master Lock</span>
                                    <Toggle checked={bond.is_locked} onChange={() => {}} />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'hierarchy' && (
                <div>
                    <SectionTitle sub="Drill down into team structures and performance">Team Hierarchy</SectionTitle>
                    
                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, background: '#f8fafc', padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <button onClick={resetHierarchy} style={{ border: 'none', background: 'transparent', color: '#059669', cursor: 'pointer', fontWeight: 600 }}>All Managers</button>
                        {hierarchyPath.map((p, i) => (
                            <React.Fragment key={p.id}>
                                <span style={{ color: '#cbd5e1' }}>/</span>
                                <button 
                                    onClick={() => setHierarchyPath(hierarchyPath.slice(0, i + 1))}
                                    style={{ border: 'none', background: 'transparent', color: i === hierarchyPath.length - 1 ? '#1e293b' : '#059669', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    {p.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {displayUsers.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', gridColumn: '1/-1' }}>No {currentDrillLevel === 1 ? 'Sub-Managers' : 'Clients'} found under this team member.</div>
                        ) : displayUsers.map(u => (
                            <Card key={u.id}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <Avatar name={u.full_name} src={u.avatar_url} size={50} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: 16 }}>{u.full_name}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>{u.role.toUpperCase()} • {u.skill_id}</div>
                                        <Badge color={kycColor(u.kyc_status)}>{u.kyc_status}</Badge>
                                    </div>
                                </div>
                                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                                    <button 
                                        onClick={() => setSelectedUser(u)}
                                        style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        View Profile
                                    </button>
                                    {u.role !== 'client' && (
                                        <button 
                                            onClick={() => drillDown(u)}
                                            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#059669', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            View Team
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div>
                    <SectionTitle sub="Manage administrative and managerial roles">Staff & Permissions</SectionTitle>
                    <Card>
                        <Table
                            headers={['User', 'Current Role', 'Action', 'KYC Status']}
                            rows={profiles.map(p => [
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Avatar name={p.full_name} src={p.avatar_url} size={32} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.full_name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.skill_id}</div>
                                    </div>
                                </div>,
                                <Badge color={p.role === 'admin' ? 'gold' : p.role === 'manager' ? 'green' : 'blue'}>
                                    {p.role.toUpperCase()}
                                </Badge>,
                                <select 
                                    defaultValue={p.role} 
                                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                    disabled={isLoading || p.id === profiles.find(pr => pr.email === 'monaalmamen@gmail.com')?.id}
                                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                >
                                    <option value="client">Investor (Client)</option>
                                    <option value="sub-manager">Sub-Manager</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>,
                                <Badge color={kycColor(p.kyc_status)}>{p.kyc_status}</Badge>
                            ])}
                        />
                    </Card>
                    <div style={{ marginTop: 24, padding: 16, background: '#fef2f2', borderRadius: 12, border: '1px solid #fee2e2' }}>
                        <p style={{ fontSize: 12, color: '#991b1b', margin: 0, fontWeight: 600 }}>
                            ⚠️ Caution: Promoting a user to Administrator gives them full access to all platform settings, bonds, and client data.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'ai_insights' && (
                <div>
                    <SectionTitle sub="Intelligent analysis of platform data and document accuracy">AI Intelligence Hub</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <Card gold>
                                <Brain size={32} color="#6366f1" style={{ marginBottom: 16 }} />
                                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Database Auditor</h3>
                                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                    Scan all deals and profiles for anomalies, fraudulent patterns, or investment trends.
                                </p>
                                <button onClick={generateDbInsights} disabled={isAnalyzing} style={{
                                    width: '100%', background: 'var(--sun-gradient)', border: 'none', borderRadius: 10, padding: '12px',
                                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}>
                                    {isAnalyzing ? 'Processing...' : 'Run Database Scan'}
                                </button>
                            </Card>

                            <Card>
                                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Upload External Data</h4>
                                <div style={{ border: '2px dashed #e2e8f0', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                                    <input type="file" id="ai-csv-upload" style={{ display: 'none' }} onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const text = await file.text();
                                            setIsAnalyzing(true);
                                            const analysis = await analyzeDocument(text, 'text');
                                            setDbInsights(analysis);
                                            setIsAnalyzing(false);
                                        }
                                    }} />
                                    <label htmlFor="ai-csv-upload" style={{ cursor: 'pointer' }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>Upload CSV/PDF for AI Review</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Gemini will analyze the content automatically</div>
                                    </label>
                                </div>
                            </Card>
                        </div>

                        <Card>
                            <SectionTitle>AI Analysis Output</SectionTitle>
                            {dbInsights ? (
                                <div style={{ 
                                    background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0',
                                    fontSize: 14, lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap', maxHeight: 600, overflowY: 'auto'
                                }}>
                                    {dbInsights}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                    <Brain size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                                    <div>Waiting for data analysis request...</div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'visibility' && (
                <div>
                    <SectionTitle sub="Manage column access per role">Visibility Governance</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                        {Object.entries(visibility).map(([role, cols]) => (
                            <Card key={role}>
                                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, textTransform: 'capitalize' }}>{role} Role</div>
                                {Object.entries(cols).map(([col, val]) => (
                                    <div key={col} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: 13 }}>{COL_LABELS[col] || col}</span>
                                        <Toggle checked={val} onChange={() => toggleVisibility(role, col)} />
                                    </div>
                                ))}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            {/* User Detail Modal */}
            {selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: 700, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ background: '#e0f2fe', padding: 32, display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid #bae6fd' }}>
                            <Avatar name={selectedUser.full_name} src={selectedUser.avatar_url} size={80} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#1e293b' }}>{selectedUser.full_name}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <Badge color="green">{selectedUser.role.toUpperCase()}</Badge>
                                    <Badge color={kycColor(selectedUser.kyc_status)}>{selectedUser.kyc_status}</Badge>
                                    <Badge color="blue">{selectedUser.skill_id}</Badge>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} style={{ background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✕</button>
                        </div>
                        <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Contact Details</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ fontSize: 14 }}><strong>Mobile:</strong> {selectedUser.mobile || '+91 98765 43210'}</div>
                                    <div style={{ fontSize: 14 }}><strong>Email:</strong> {selectedUser.email || 'user@bondvault.io'}</div>
                                    <div style={{ fontSize: 14 }}><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Team Context</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ fontSize: 14 }}><strong>Direct Manager:</strong> {profiles.find(p => p.id === selectedUser.manager_id)?.full_name || 'None'}</div>
                                    <div style={{ fontSize: 14 }}><strong>Account Status:</strong> <span style={{ color: selectedUser.is_active ? '#059669' : '#ef4444' }}>{selectedUser.is_active ? 'Active' : 'Restricted'}</span></div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '0 32px 32px' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Verification Documents</div>
                            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                                <FileCheck size={18} style={{ marginRight: 8 }} /> No documents available for preview
                            </div>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '20px 32px', display: 'flex', gap: 12 }}>
                            <button 
                                onClick={() => handleUserAction(selectedUser.id, 'approve')}
                                disabled={isLoading}
                                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#059669', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
                            >
                                {isLoading ? 'Processing...' : 'Approve Everything'}
                            </button>
                            <button 
                                onClick={() => handleUserAction(selectedUser.id, 'flag')}
                                disabled={isLoading}
                                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
                            >
                                {isLoading ? 'Processing...' : 'Flag Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
