import React, { useState, useEffect } from 'react';
import {
  PieChart, FileText, Users, Briefcase, Download, Lock,
  LineChart, List, Wallet, Home, Search, BarChart2, History,
  CheckCircle, Plus, Sun, Lock as LockIcon, Info
} from 'lucide-react';
import './index.css';
import './App.css';
import { supabase } from './lib/supabase';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/panels/AdminPanel';
import ManagerPanel from './components/panels/ManagerPanel';
import SubManagerPanel from './components/panels/SubManagerPanel';
import ClientPanel from './components/panels/ClientPanel';
import { DEFAULT_VISIBILITY } from './components/panels/Shared';

const MOCK_BONDS = [
  { id: 1, name: 'Govt Securities 2031', type: 'Government Bond', rating: 'AAA', yield: '7.25%', maturity: '2031-06', payout: 'Semi-Annual', faceVal: '₹10,000', mutable: true, guaranteed: 'Sovereign guaranteed' },
  { id: 2, name: 'HDFC Infrastructure Bond', type: 'Corporate Bond', rating: 'AA+', yield: '8.10%', maturity: '2028-03', payout: 'Annual', faceVal: '₹5,000', mutable: false, guaranteed: 'Corporate backed' },
  { id: 3, name: 'Municipal Corp 2030', type: 'Municipal Bond', rating: 'A', yield: '6.75%', maturity: '2030-12', payout: 'Quarterly', faceVal: '₹1,000', mutable: false, guaranteed: 'City guaranteed' },
  { id: 4, name: 'RBI Floating Rate Savings', type: 'Government Bond', rating: 'AAA', yield: '7.88%', maturity: '2032-09', payout: 'Semi-Annual', faceVal: '₹1,000', mutable: true, guaranteed: 'RBI backed' }
];

const ROLES = {
  admin: {
    title: 'Admin Panel', avatar: 'AD', bg: '#0b1f38',
    nav: [
      { id: 'admin-dashboard', icon: <PieChart size={16} />, label: 'Dashboard', group: 'MANAGEMENT' },
      { id: 'admin-bonds', icon: <FileText size={16} />, label: 'Bonds / Scripts', group: 'MANAGEMENT' },
      { id: 'admin-hierarchy', icon: <Users size={16} />, label: 'Team Hierarchy', group: 'MANAGEMENT' },
      { id: 'admin-users', icon: <Users size={16} />, label: 'Users & Roles', group: 'MANAGEMENT' },
      { id: 'admin-deals', icon: <Briefcase size={16} />, label: 'All Deals', group: 'MANAGEMENT' },
      { id: 'admin-import', icon: <Download size={16} />, label: 'Import CSV / PDF', group: 'DATA' },
      { id: 'admin-permissions', icon: <Lock size={16} />, label: 'Permissions', group: 'SETTINGS' }
    ]
  },
  manager: {
    title: 'Manager Panel', avatar: 'RK', bg: '#064e3b',
    nav: [
      { id: 'mgr-dashboard', icon: <LineChart size={16} />, label: 'Dashboard', group: 'MAIN' },
      { id: 'mgr-bonds', icon: <List size={16} />, label: 'Bond Listings', group: 'MAIN' },
      { id: 'mgr-team', icon: <Users size={16} />, label: 'My Team', group: 'MAIN' },
      { id: 'mgr-deals', icon: <Briefcase size={16} />, label: 'Team Deals', group: 'MAIN' },
      { id: 'mgr-portfolio', icon: <Wallet size={16} />, label: 'Portfolio', group: 'MAIN' }
    ]
  },
  'sub-manager': {
    title: 'Sub-Manager Panel', avatar: 'SM', bg: '#1e40af',
    nav: [
      { id: 'mgr-dashboard', icon: <LineChart size={16} />, label: 'Dashboard', group: 'MAIN' },
      { id: 'mgr-bonds', icon: <List size={16} />, label: 'Bond Listings', group: 'MAIN' },
      { id: 'mgr-team', icon: <Users size={16} />, label: 'My Clients', group: 'MAIN' },
    ]
  },
  client: {
    title: 'Client Portal', avatar: 'AS', bg: '#0b1f38',
    nav: [
      { id: 'cli-dashboard', icon: <Home size={16} />, label: 'My Dashboard', group: 'PORTAL' },
      { id: 'cli-browse', icon: <Search size={16} />, label: 'Browse Bonds', group: 'PORTAL' },
      { id: 'cli-portfolio', icon: <BarChart2 size={16} />, label: 'My Portfolio', group: 'PORTAL' },
      { id: 'cli-deals', icon: <History size={16} />, label: 'My Deals', group: 'PORTAL' }
    ]
  }
};


  function App() {
    // ── State Management ──
    const [appView, setAppView] = useState('landing');
    const [authMode, setAuthMode] = useState('login');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [role, setRole] = useState(null);
    const [activeNav, setActiveNav] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState(null);

    // Data lists
    const [bondsList, setBondsList] = useState([]);
    const [dealsList, setDealsList] = useState([]);
    const [profilesList, setProfilesList] = useState([]);
    const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
    const [showBondModal, setShowBondModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);

    const toggleVisibility = (role, col) => {
      setVisibility(prev => ({
        ...prev,
        [role]: { ...prev[role], [col]: !prev[role][col] }
      }));
    };

    // ── Authentication & Data Initialization ──
    useEffect(() => {
      // 1. Manage Auth Session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
          setAppView('app');
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
          setAppView('app');
        } else {
          setAppView('landing');
          setRole(null);
          setActiveNav(null);
        }
      });

      // 2. Initial Data Fetch
      fetchData();

      // 3. Loading Animation Simulation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setLoading(false), 300);
            return 100;
          }
          return Math.min(100, prev + Math.floor(Math.random() * 15) + 5);
        });
      }, 100);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }, []);

    const fetchData = async () => {
      try {
        const [bondsRes, dealsRes, profilesRes] = await Promise.all([
          supabase.from('bonds').select('*').order('created_at', { ascending: false }),
          supabase.from('deals').select('*, profiles(full_name), bonds(name)').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false })
        ]);

        if (!bondsRes.error) setBondsList(bondsRes.data);
        if (!dealsRes.error) setDealsList(dealsRes.data);
        if (!profilesRes.error) setProfilesList(profilesRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    const fetchUserProfile = async (userId) => {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (data) {
        setRole(data.role);
        // Default tabs per role
        const defaultNav = {
          admin: 'admin-dashboard',
          manager: 'mgr-dashboard',
          'sub-manager': 'mgr-dashboard',
          client: 'cli-dashboard'
        };
        setActiveNav(defaultNav[data.role] || 'cli-dashboard');
      } else if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
           console.log('Profile missing. Attempting to create fallback profile...');
           // Try to create the profile manually for existing auth users who missed the trigger
           const { error: insertError } = await supabase.from('profiles').insert([
             { 
               id: userId, 
               role: user?.email === 'monaalmamen@gmail.com' ? 'admin' : 'client', 
               full_name: user?.email?.split('@')[0] 
             }
           ]);
           
           if (!insertError || insertError.code === '23505') { // Success or already exists
             setTimeout(() => fetchUserProfile(userId), 1000);
           } else {
             console.error('Failed to create fallback profile:', insertError);
             setRole('client');
             setActiveNav('cli-dashboard');
           }
        } else {
           setRole('client');
           setActiveNav('cli-dashboard');
        }
      }
    };

    // ── Handlers ──
    const handleInvest = async (bondId, amount = 100000) => {
      if (!user) { setAuthMode('login'); setShowAuthModal(true); return; }
      const { error } = await supabase.from('deals').insert([{
        profile_id: user.id,
        bond_id: bondId,
        amount: amount,
        status: 'pending'
      }]);
      if (error) alert(error.message);
      else { alert('Investment request submitted!'); fetchData(); }
    };

    const handleAuthSuccess = () => {
      setShowAuthModal(false);
      setAppView('app');
    };

    const handleSignUp = () => { setAuthMode('signup'); setShowAuthModal(true); };
    const handleLogin = () => { setAuthMode('login'); setShowAuthModal(true); };

    const toggleLock = async (bondId, currentStatus) => {
      const { error } = await supabase.from('bonds').update({ status: currentStatus === 'locked' ? 'active' : 'locked' }).eq('id', bondId);
      if (!error) fetchData();
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
    };

    // ── Helper Logic ──
    const currentRoleData = ROLES[role] || ROLES.client;
    const activeNavItem = currentRoleData.nav.find(n => n.id === activeNav) || currentRoleData.nav[0];

    const navGroups = currentRoleData.nav.reduce((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {});

    const handleAddBondSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newBond = {
        name: formData.get('name'),
        type: formData.get('type'),
        rating: formData.get('rating'),
        yield_rate: parseFloat(formData.get('yield_rate')),
        maturity_date: formData.get('maturity'),
        payout: formData.get('payout'),
        face_value: parseInt(formData.get('face_value').replace(/[^0-9]/g, '')),
        guaranteed_by: formData.get('guaranteed'),
        status: formData.get('mutable') === 'on' ? 'active' : 'locked'
      };
      const { error } = await supabase.from('bonds').insert([newBond]);
      if (error) alert(error.message);
      else { setShowBondModal(false); fetchData(); }
    };

    const handleAddClientSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newProfile = {
        full_name: formData.get('full_name'),
        mobile: formData.get('mobile'),
        skill_id: formData.get('skill_id'),
        role: formData.get('role'),
        is_active: true,
        kyc_status: 'pending'
      };
      const { error } = await supabase.from('profiles').insert([newProfile]);
      if (error) alert(error.message);
      else { setShowClientModal(false); fetchData(); }
    };

    const renderContent = () => {
      if (!role || !activeNav) return <div>Loading Profile...</div>;

      const commonProps = {
        bonds: bondsList,
        profiles: profilesList,
        deals: dealsList,
        activeNav: activeNav, 
        visibility: visibility,
        toggleVisibility: toggleVisibility,
        fetchData: fetchData 
      };

      switch (role) {
        case 'admin':
          return <AdminPanel {...commonProps} adminId={user?.id} />;
        case 'manager':
          return <ManagerPanel {...commonProps} managerId={user?.id} />;
        case 'sub-manager':
          return <SubManagerPanel {...commonProps} subManagerId={user?.id} />;
        case 'client':
          return <ClientPanel {...commonProps} clientId={user?.id} />;
        default:
          return <ClientPanel {...commonProps} clientId={user?.id} />;
      }
    };

    // ── Render Logic ──
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-logo-container">
              <Sun className="loading-icon pulse-animation" size={64} />
            </div>
            <h1 className="loading-title">BondVault</h1>
            <p className="loading-subtitle">Securing your access...</p>
            <div className="loading-bar-container">
              <div className="loading-bar-progress" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="loading-percentage">{progress}%</div>
          </div>
        </div>
      );
    }

    if (appView === 'landing') {
      return (
        <>
          <LandingPage onSignUp={handleSignUp} onLogin={handleLogin} />
          {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />}
        </>
      );
    }

    return (
      <div className="app-container">
        <main className="main-content">
          <header className="top-header">
            <div className="header-left">
              <div className="search-bar-premium">
                <Search size={18} color="#94a3b8" />
                <input type="text" placeholder="Search portfolio..." />
              </div>
            </div>
            <nav className="header-nav-tabs">
              <span className="nav-tab active">Dashboard</span>
              <span className="nav-tab" onClick={() => setAppView('landing')}>Back to Site</span>
            </nav>
            <div className="header-right">
              <div className="header-actions-icons">
                {/* Sun icon removed as requested */}
                <button onClick={handleLogout} className="icon-btn">
                  <Lock size={16} color="#1e293b" />
                </button>
                <div className="notif-dot"></div>
              </div>
              <div className="role-indicator">
                <div className="user-info-text">
                  <span className="user-name">{user?.email?.split('@')[0] || 'User'}</span>
                  <span className="user-role">{role ? role.toUpperCase() : 'LOADING...'}</span>
                </div>
                <div className="avatar profile-avatar-clean"><Users size={20} /></div>
              </div>
            </div>
          </header>
          <div className="view-container">
            {renderContent()}
          </div>
        </main>

        <aside className="right-sidebar">
          <div className="sidebar-header" style={{ textAlign: 'right', padding: '0 24px 40px' }}>
            <div className="lp-logo" style={{ justifyContent: 'flex-end' }}>
              <span className="lp-logo-text" style={{ fontSize: '28px' }}>BondVault</span>
              <div style={{ background: '#059669', color: 'white', padding: '8px', borderRadius: '8px', marginLeft: '12px' }}>
                <Briefcase size={24} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>INSTITUTIONAL ACCESS</div>
          </div>
          <nav className="sidebar-nav">
            {Object.entries(navGroups).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 32 }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                    onClick={() => setActiveNav(item.id)}
                  >
                    {item.label}
                    <div className="nav-icon">{item.icon}</div>
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer-minimal">
            <div className="nav-item">Security <LockIcon size={16} /></div>
            <div className="nav-item">Support <Info size={16} /></div>
            <div style={{ textAlign: 'right', fontSize: '10px', color: '#cbd5e1', marginTop: '20px' }}>v1.2.1-stable <span style={{ color: '#10b981' }}>●</span></div>
          </div>
        </aside>

        {showBondModal && (
          <div className="modal-overlay" onClick={() => setShowBondModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Bond</h3>
                <button className="close-btn" onClick={() => setShowBondModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleAddBondSubmit}>
                <div className="form-group"><label>Bond Name</label><input type="text" name="name" required /></div>
                <div className="form-group"><label>Type</label><select name="type"><option>Government Bond</option><option>Corporate Bond</option><option>Municipal Bond</option></select></div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}><label>Rating</label><input type="text" name="rating" required /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Yield Rate</label><input type="text" name="yield_rate" placeholder="e.g. 7.50%" required /></div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}><label>Maturity</label><input type="text" name="maturity" placeholder="YYYY-MM" required /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Payout</label><select name="payout"><option>Annual</option><option>Semi-Annual</option><option>Quarterly</option></select></div>
                </div>
                <div className="form-group"><label>Face Value</label><input type="text" name="face_value" placeholder="₹10,000" required /></div>
                <div className="form-group"><label>Guaranteed By</label><input type="text" name="guaranteed" required /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" name="mutable" style={{ width: 'auto' }} /> <label style={{ margin: 0 }}>Is Mutable?</label></div>
                <div className="form-actions">
                  <button type="button" className="btn" onClick={() => setShowBondModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Bond</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showClientModal && (
          <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Client</h3>
                <button className="close-btn" onClick={() => setShowClientModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleAddClientSubmit}>
                <div className="form-group"><label>Full Name</label><input type="text" name="full_name" required /></div>
                <div className="form-group"><label>Mobile Number</label><input type="tel" name="mobile" required /></div>
                <div className="form-group"><label>Skill ID</label><input type="text" name="skill_id" required /></div>
                <div className="form-group"><label>Role</label><select name="role"><option value="client">Client</option><option value="sub-manager">Sub-Manager</option><option value="manager">Manager</option></select></div>
                <div className="form-actions">
                  <button type="button" className="btn" onClick={() => setShowClientModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Client</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

export default App;
