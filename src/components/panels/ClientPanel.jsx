import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    MOCK_BONDS, MOCK_PROFILES, MOCK_DEALS, DEFAULT_VISIBILITY, 
    Badge, statusColor, kycColor, Avatar, Card, SectionTitle, StatCard, Table 
} from './Shared';

export default function ClientPanel({ clientId, profiles = [], bonds = [], deals = [], activeNav, visibility }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [kycSubmissions, setKycSubmissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activeNav) {
            const tabMap = {
                'cli-dashboard': 'dashboard',
                'cli-bonds': 'browse',
                'cli-deals': 'deals',
                'cli-kyc': 'kyc',
                'cli-profile': 'profile',
                'cli-portfolio': 'portfolio'
            };
            const mappedTab = tabMap[activeNav];
            if (mappedTab) setActiveTab(mappedTab);
        }
    }, [activeNav]);

    const vis = visibility.client;
    const me = profiles.find(p => p.id === clientId) || {};
    const myDeals = deals.filter(d => d.profile_id === clientId);
    const myBonds = myDeals.filter(d => d.status === 'done').map(d => bonds.find(b => b.id === d.bond_id)).filter(Boolean);
    const manager = profiles.find(p => p.id === me.manager_id);
    const subMgr = profiles.find(p => p.id === me.sub_manager_id);
    const totalInvested = myDeals.filter(d => d.status === 'done').reduce((s, d) => s + d.amount, 0);

    useEffect(() => {
        if (clientId) fetchKycSubmissions();
    }, [clientId]);

    const fetchKycSubmissions = async () => {
        const { data, error } = await supabase
            .from('kyc_submissions')
            .select('*')
            .eq('profile_id', clientId)
            .order('created_at', { ascending: false });
        if (data) setKycSubmissions(data);
    };

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const docType = formData.get('docType');
        const file = formData.get('docFile');
        const notes = formData.get('notes');

        try {
            // Mock file upload to Supabase Storage (Simulated URL)
            // In real app: await supabase.storage.from('kyc-docs').upload(...)
            const mockUrl = `https://storage.bondvault.io/kyc/${clientId}/${docType}_${Date.now()}.pdf`;

            const { error } = await supabase.from('kyc_submissions').insert([{
                profile_id: clientId,
                doc_type: docType,
                doc_url: mockUrl,
                status: 'pending',
                encrypted_notes: notes // Simulated encryption
            }]);

            if (error) throw error;
            alert('KYC documents submitted successfully!');
            fetchKycSubmissions();
            e.target.reset();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'dashboard', label: '🏠 Dashboard' },
        { id: 'browse', label: '🔍 Browse Bonds' },
        { id: 'deals', label: '📑 My Deals' },
        { id: 'kyc', label: '🛡️ KYC Verification' },
        { id: 'profile', label: '👤 My Profile' },
    ];
    if (vis.portfolio) tabs.push({ id: 'portfolio', label: '💼 Portfolio' });

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", color: '#1e293b' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={me.full_name} size={42} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{me.full_name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: {me.skill_id || clientId.slice(0, 8)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Badge color={kycColor(me.kyc_status)}>{me.kyc_status}</Badge>
                    <Badge color={me.is_active ? 'green' : 'red'}>{me.is_active ? 'Account Active' : 'Account Inactive'}</Badge>
                </div>
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
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18, marginBottom: 24 }}>
                        <StatCard gold label="Total Portfolio" value={`₹${(totalInvested / 100000).toFixed(1)}L`} sub="+₹4,200 (2.4%)" />
                        <StatCard label="Active Bonds" value={myBonds.length} sub="In your vault" />
                        <StatCard gold label="Next Payout" value="₹12,400" sub="Due in 12 days" />
                        <StatCard label="Pending Deals" value={myDeals.filter(d => d.status === 'pending').length} sub="Awaiting approval" subColor="#d97706" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                        <Card>
                            <SectionTitle>Recent Deals</SectionTitle>
                            <Table
                                headers={['Bond', 'Amount', 'Status']}
                                rows={myDeals.slice(0, 5).map(d => {
                                    const b = bonds.find(x => x.id === d.bond_id);
                                    return [
                                        <span style={{ fontWeight: 600, fontSize: 13 }}>{b?.name || 'Bond Record'}</span>,
                                        <span style={{ fontWeight: 700 }}>₹{(d.amount / 1000).toFixed(0)}K</span>,
                                        <Badge color={statusColor(d.status)}>{d.status}</Badge>,
                                    ];
                                })}
                                emptyMsg="No deals yet. Browse bonds to start investing!"
                            />
                        </Card>
                        <Card>
                            <SectionTitle>Relationship Team</SectionTitle>
                            {manager ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 12 }}>
                                        <Avatar name={manager.full_name} size={40} />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{manager.full_name}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Primary Manager</div>
                                        </div>
                                    </div>
                                    {subMgr && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 12 }}>
                                            <Avatar name={subMgr.full_name} size={40} />
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{subMgr.full_name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8' }}>Support Executive</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>No manager assigned yet.</div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'kyc' && (
                <div>
                    <SectionTitle sub="Upload documents to verify your identity and unlock investment limits">KYC Verification Center</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <Card>
                            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Submit New Document</h3>
                            <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Document Type</label>
                                    <select name="docType" required style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}>
                                        <option value="Aadhar">Aadhar Card</option>
                                        <option value="PAN">PAN Card</option>
                                        <option value="Passport">Passport</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Upload File (PDF/JPG)</label>
                                    <input type="file" name="docFile" required style={{ width: '100%', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: 8 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Additional Remarks (Encrypted)</label>
                                    <textarea name="notes" placeholder="Any details for the auditor..." style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, height: 80 }} />
                                </div>
                                <button type="submit" disabled={isSubmitting} style={{
                                    background: 'var(--sun-gradient)', border: 'none', borderRadius: 10, padding: '12px',
                                    fontWeight: 700, color: '#1a1200', cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    {isSubmitting ? 'Uploading...' : 'Submit Verification Request'}
                                </button>
                            </form>
                        </Card>
                        <Card>
                            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Submission History</h3>
                            <Table
                                headers={['Type', 'Status', 'Submitted']}
                                rows={kycSubmissions.map(s => [
                                    <div style={{ fontWeight: 600 }}>{s.doc_type}</div>,
                                    <Badge color={s.status === 'approved' ? 'green' : s.status === 'pending' ? 'gold' : 'red'}>{s.status}</Badge>,
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(s.created_at).toLocaleDateString()}</div>
                                ])}
                                emptyMsg="No submissions found."
                            />
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'browse' && (
                <div>
                    <SectionTitle sub="Explore premium high-yield bonds">Investment Opportunities</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                        {bonds.filter(b => b.status === 'active').map(bond => (
                            <div key={bond.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, transition: 'all 0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#ffd700'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Badge color="gold">{bond.type}</Badge>
                                    <div style={{ fontWeight: 800, color: '#059669' }}>{bond.yield_rate}% Yield</div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{bond.name}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{bond.issuer}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                    <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#94a3b8' }}>Maturity</div>
                                        <div style={{ fontWeight: 700, fontSize: 12 }}>{bond.maturity_date}</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#94a3b8' }}>Face Value</div>
                                        <div style={{ fontWeight: 700, fontSize: 12 }}>₹{(bond.face_value / 1000).toFixed(0)}K</div>
                                    </div>
                                </div>
                                <button style={{ width: '100%', background: 'var(--sun-gradient)', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 13, cursor: 'pointer', color: '#1a1200' }}>
                                    Invest Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Card gold>
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
                                    <Avatar name={me.full_name} src={me.avatar_url} size={100} />
                                    <label style={{ 
                                        position: 'absolute', bottom: 0, right: 0, background: '#fff', 
                                        borderRadius: '50%', padding: 6, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                                    }}>
                                        <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                // Simulated upload
                                                const fakeUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";
                                                await supabase.from('profiles').update({ avatar_url: fakeUrl }).eq('id', clientId);
                                                alert('Profile picture updated!');
                                                fetchData();
                                            }
                                        }} />
                                        📸
                                    </label>
                                </div>
                                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 800 }}>{me.full_name}</div>
                                <div style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 12px' }}>{me.skill_id || 'Client Account'}</div>
                                <Badge color={kycColor(me.kyc_status)}>{me.kyc_status?.toUpperCase()}</Badge>
                            </div>
                        </Card>
                        
                        <Card>
                            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Security Overview</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748b' }}>Account Status</span>
                                    <span style={{ color: '#059669', fontWeight: 700 }}>● Active</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748b' }}>Verification</span>
                                    <span style={{ color: me.kyc_status === 'verified' ? '#059669' : '#d97706', fontWeight: 700 }}>
                                        {me.kyc_status === 'verified' ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <SectionTitle>Update Profile Information</SectionTitle>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.target);
                            const updates = {
                                full_name: fd.get('full_name'),
                                mobile: fd.get('mobile'),
                            };
                            const { error } = await supabase.from('profiles').update(updates).eq('id', clientId);
                            if (error) alert(error.message);
                            else { alert('Profile updated!'); fetchData(); }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Full Name</label>
                                    <input type="text" name="full_name" defaultValue={me.full_name || ""} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Mobile Number</label>
                                    <input type="tel" name="mobile" defaultValue={me.mobile || ""} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Skill ID (Read Only)</label>
                                <input type="text" value={me.skill_id || ""} readOnly style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Primary Manager</label>
                                    <input type="text" value={manager?.full_name || 'Not Assigned'} readOnly style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#64748b' }}>Account Type</label>
                                    <input type="text" value={me.role?.toUpperCase() || ""} readOnly style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                </div>
                            </div>
                            <button type="submit" style={{
                                background: '#059669', border: 'none', borderRadius: 10, padding: '12px',
                                fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: 10
                            }}>Save Changes</button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
