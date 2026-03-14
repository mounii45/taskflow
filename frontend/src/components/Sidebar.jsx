
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      textDecoration: 'none', transition: 'var(--transition)',
      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem',
      background: isActive ? 'var(--accent-glow)' : 'transparent',
      color: isActive ? 'var(--accent-2)' : 'var(--text-2)',
      borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    })}
  >
    <span style={{ fontSize: '1rem' }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: 220, minHeight: '100vh', background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0,
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 0 12px var(--accent-glow-strong)',
            }}>T</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>TaskFlow</span>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem to="/dashboard" icon="◈" label="Dashboard" />
          <NavItem to="/tasks" icon="✦" label="My Tasks" />
          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />
              <p style={{ padding: '4px 14px', fontSize: '0.7rem', fontFamily: 'var(--font-display)', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</p>
              <NavItem to="/admin/users" icon="◉" label="Users" />
              <NavItem to="/admin/stats" icon="◐" label="Analytics" />
            </>
          )}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-3)', marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-2)', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8rem', transition: 'var(--transition)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; }}>
            ⇥ Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="mobile-navbar" style={{ display: 'none', position: 'sticky', top: 0, zIndex: 200, background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>T</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>TaskFlow</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--text)', cursor: 'pointer', fontSize: '1.1rem' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 53, left: 0, right: 0, bottom: 0, background: 'var(--bg-2)', zIndex: 199, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease', overflowY: 'auto' }}>
          <NavItem to="/dashboard" icon="◈" label="Dashboard" onClick={closeMenu} />
          <NavItem to="/tasks" icon="✦" label="My Tasks" onClick={closeMenu} />
          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />
              <p style={{ padding: '4px 14px', fontSize: '0.7rem', fontFamily: 'var(--font-display)', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</p>
              <NavItem to="/admin/users" icon="◉" label="Users" onClick={closeMenu} />
              <NavItem to="/admin/stats" icon="◐" label="Analytics" onClick={closeMenu} />
            </>
          )}
          <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-3)', marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-2)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '11px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
              ⇥ Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-navbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-navbar { display: none !important; }
        }
      `}</style>
    </>
  );
}