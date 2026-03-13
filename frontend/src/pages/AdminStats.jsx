import { useState, useEffect } from 'react';
import { userApi, taskApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Card, Spinner } from '../components/UI';

const StatBlock = ({ label, value, color = 'var(--text)', icon, delay = 0 }) => (
  <Card style={{ animation: `fadeIn 0.4s ease ${delay}ms both`, textAlign: 'center', padding: '24px 16px' }}>
    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{icon}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '–'}</div>
    <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', marginTop: 6, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{label}</p>
  </Card>
);

const HorizontalBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{value} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
    </div>
  );
};

export default function AdminStats() {
  const [adminStats, setAdminStats] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes] = await Promise.all([
          userApi.adminStats(),
          taskApi.stats(),
        ]);
        setAdminStats(aRes.data.data);
        setTaskStats(tRes.data.data);
      } catch {
        toast.error('Failed to load analytics');
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

  // Parse user stats
  const userByRole = {};
  (adminStats?.userStats || []).forEach(s => { userByRole[s._id] = s.count; });
  const totalUsers = Object.values(userByRole).reduce((a, b) => a + b, 0);

  // Parse task stats from aggregate
  const taskByStatus = {};
  (adminStats?.taskStats || []).forEach(s => { taskByStatus[s._id] = s.count; });
  const totalTasksFromAdmin = Object.values(taskByStatus).reduce((a, b) => a + b, 0);

  const totalTasks = taskStats?.total || totalTasksFromAdmin || 0;
  const completionRate = totalTasks ? Math.round(((taskStats?.done || taskByStatus['done'] || 0) / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }} className="animate-in">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem' }}>Analytics</h1>
        <p style={{ color: 'var(--text-2)', marginTop: 4 }}>Platform-wide overview</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatBlock label="Total Users" value={totalUsers} icon="◉" color="var(--accent-2)" delay={0} />
        <StatBlock label="Admin Users" value={userByRole['admin'] || 0} icon="★" color="var(--yellow)" delay={60} />
        <StatBlock label="Regular Users" value={userByRole['user'] || 0} icon="○" color="var(--blue)" delay={120} />
        <StatBlock label="Total Tasks" value={totalTasks} icon="◈" color="var(--text)" delay={180} />
        <StatBlock label="Completion Rate" value={`${completionRate}%`} icon="✓" color="var(--green)" delay={240} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Task Status Breakdown */}
        <Card style={{ animation: 'fadeIn 0.4s ease 300ms both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>
            Tasks by Status
          </h2>
          <HorizontalBar label="To Do" value={taskStats?.todo || taskByStatus['todo'] || 0} max={totalTasks} color="var(--blue)" />
          <HorizontalBar label="In Progress" value={taskStats?.inProgress || taskByStatus['in_progress'] || 0} max={totalTasks} color="var(--yellow)" />
          <HorizontalBar label="Done" value={taskStats?.done || taskByStatus['done'] || 0} max={totalTasks} color="var(--green)" />
        </Card>

        {/* Task Priority Breakdown */}
        <Card style={{ animation: 'fadeIn 0.4s ease 360ms both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>
            Tasks by Priority
          </h2>
          <HorizontalBar label="High Priority" value={taskStats?.high || 0} max={totalTasks} color="var(--red)" />
          <HorizontalBar label="Medium Priority" value={taskStats?.medium || 0} max={totalTasks} color="var(--yellow)" />
          <HorizontalBar label="Low Priority" value={taskStats?.low || 0} max={totalTasks} color="var(--green)" />
        </Card>
      </div>

      {/* Donut-style visual */}
      <Card style={{ animation: 'fadeIn 0.4s ease 420ms both' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>
          Platform Health
        </h2>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* SVG ring */}
          <svg width={120} height={120} viewBox="0 0 120 120">
            {(() => {
              const segments = [
                { value: taskStats?.done || 0, color: 'var(--green)' },
                { value: taskStats?.inProgress || 0, color: 'var(--yellow)' },
                { value: taskStats?.todo || 0, color: 'var(--blue)' },
              ];
              const total = segments.reduce((a, s) => a + s.value, 0) || 1;
              const r = 46, cx = 60, cy = 60;
              const circumference = 2 * Math.PI * r;
              let offset = 0;
              return segments.map((seg, i) => {
                const dash = (seg.value / total) * circumference;
                const el = (
                  <circle
                    key={i} cx={cx} cy={cy} r={r}
                    fill="none" stroke={seg.color} strokeWidth={14}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                );
                offset += dash;
                return el;
              });
            })()}
            <text x="60" y="56" textAnchor="middle" fill="var(--text)" fontSize="18" fontFamily="var(--font-display)" fontWeight="800">{completionRate}%</text>
            <text x="60" y="70" textAnchor="middle" fill="var(--text-3)" fontSize="9" fontFamily="var(--font-body)">done</text>
          </svg>

          <div style={{ flex: 1, minWidth: 200 }}>
            {[
              { label: 'Completed tasks', value: taskStats?.done || 0, color: 'var(--green)' },
              { label: 'In progress tasks', value: taskStats?.inProgress || 0, color: 'var(--yellow)' },
              { label: 'Pending tasks', value: taskStats?.todo || 0, color: 'var(--blue)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-2)' }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
