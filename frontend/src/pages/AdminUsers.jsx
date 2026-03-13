import { useState, useEffect } from 'react';
import { userApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Card, Badge, Button, Spinner, EmptyState, Modal } from '../components/UI';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // { type, userId, userName }
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.getAll({ limit: 50 });
      setUsers(data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async () => {
    const { type, userId } = confirmAction;
    try {
      if (type === 'deactivate') {
        await userApi.deactivate(userId);
        toast.success('User deactivated');
      } else if (type === 'promote') {
        await userApi.promote(userId);
        toast.success('User promoted to admin');
      }
      setConfirmAction(null);
      fetchUsers();
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }} className="animate-in">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem' }}>Users</h1>
        <p style={{ color: 'var(--text-2)', marginTop: 4 }}>{users.length} registered users</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={28} /></div>
      ) : users.length === 0 ? (
        <EmptyState icon="◉" title="No users found" />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                    color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user._id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    animation: `fadeIn 0.3s ease ${i * 30}ms both`,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent-glow)', border: '1px solid var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-2)',
                        flexShrink: 0,
                      }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><Badge variant={user.role}>{user.role}</Badge></td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: user.isActive ? 'var(--green)' : 'var(--red)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-3)', fontSize: '0.8rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {user.role !== 'admin' && (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: 'promote', userId: user._id, userName: user.name })}>
                          Promote
                        </Button>
                      )}
                      {user.isActive && (
                        <Button variant="danger" size="sm" onClick={() => setConfirmAction({ type: 'deactivate', userId: user._id, userName: user.name })}>
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'promote' ? 'Promote User' : 'Deactivate User'}
        width={360}
      >
        <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>
          {confirmAction?.type === 'promote'
            ? `Grant admin privileges to "${confirmAction?.userName}"?`
            : `Deactivate account for "${confirmAction?.userName}"?`}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            variant={confirmAction?.type === 'deactivate' ? 'danger' : 'primary'}
            onClick={handleAction}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
