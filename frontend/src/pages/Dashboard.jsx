import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Spinner, Button } from '../components/UI';

const StatCard = ({ label, value, color, icon, delay = 0 }) => (
  <Card style={{ animation: `fadeIn 0.4s ease ${delay}ms both` }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color }}>{value ?? '–'}</span>
    </div>
    <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{label}</p>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          taskApi.stats(),
          taskApi.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
        ]);
        setStats(statsRes.data.data);
        setRecentTasks(tasksRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spinner size={32} />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }} className="animate-in">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-2)' }}>
          Here's what's happening with your tasks today.
        </p>
        {user?.role === 'admin' && (
          <Badge variant="admin" style={{ marginTop: 8, display: 'inline-flex' }}>Admin</Badge>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Tasks" value={stats?.total} color="var(--text)" icon="◈" delay={0} />
        <StatCard label="To Do" value={stats?.todo} color="var(--blue)" icon="○" delay={50} />
        <StatCard label="In Progress" value={stats?.inProgress} color="var(--yellow)" icon="◑" delay={100} />
        <StatCard label="Completed" value={stats?.done} color="var(--green)" icon="●" delay={150} />
      </div>

      {/* Priority breakdown */}
      {stats?.total > 0 && (
        <Card style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease 200ms both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Priority Breakdown</h2>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'High', value: stats?.high, color: 'var(--red)' },
              { label: 'Medium', value: stats?.medium, color: 'var(--yellow)' },
              { label: 'Low', value: stats?.low, color: 'var(--green)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{value || 0}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${stats.total ? ((value || 0) / stats.total) * 100 : 0}%`,
                    background: color, borderRadius: 3, transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent tasks */}
      <Card style={{ animation: 'fadeIn 0.4s ease 250ms both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Recent Tasks</h2>
          <Link to="/tasks" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm">View all →</Button>
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)' }}>
            <p style={{ marginBottom: 12 }}>No tasks yet.</p>
            <Link to="/tasks"><Button size="sm">Create your first task</Button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentTasks.map((task) => (
              <div key={task._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--bg-3)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                  <Badge variant={task.priority}>{task.priority}</Badge>
                  <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
