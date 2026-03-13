import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Textarea, Card, Badge, Modal, Spinner, EmptyState } from '../components/UI';

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];
const PRIORITIES = [
  { value: '', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const defaultForm = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: '' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await taskApi.getAll(params);
      setTasks(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const openCreate = () => { setEditTask(null); setForm(defaultForm); setFormErrors({}); setModalOpen(true); };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      tags: (task.tags || []).join(', '),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    if (form.description.length > 500) e.description = 'Max 500 characters';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || undefined,
      };
      if (editTask) {
        await taskApi.update(editTask._id, payload);
        toast.success('Task updated');
      } else {
        await taskApi.create(payload);
        toast.success('Task created');
      }
      setModalOpen(false);
      fetchTasks(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fe = {};
        err.response.data.errors.forEach(e => { fe[e.field] = e.message; });
        setFormErrors(fe);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskApi.delete(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
      fetchTasks(pagination.page);
    } catch {
      toast.error('Delete failed');
    }
  };

  const setFilter = (key) => (e) => setFilters(p => ({ ...p, [key]: e.target.value }));
  const setField = (key) => (e) => { setForm(p => ({ ...p, [key]: e.target.value })); setFormErrors(p => ({ ...p, [key]: '' })); };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }} className="animate-in">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem' }}>Tasks</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 4 }}>{pagination.total} task{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={openCreate}>+ New Task</Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <Input placeholder="Search tasks..." value={filters.search} onChange={setFilter('search')} icon="🔍" />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <Select options={STATUSES} value={filters.status} onChange={setFilter('status')} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <Select options={PRIORITIES} value={filters.priority} onChange={setFilter('priority')} />
          </div>
          {(filters.status || filters.priority || filters.search) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ status: '', priority: '', search: '' })}>Clear</Button>
          )}
        </div>
      </Card>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={28} /></div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✦" title="No tasks found"
          description={filters.status || filters.priority || filters.search ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
          action={!filters.status && !filters.priority && !filters.search && (
            <Button onClick={openCreate}>Create Task</Button>
          )}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((task, i) => (
            <Card key={task._id} hoverable style={{ animation: `fadeIn 0.3s ease ${i * 40}ms both`, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Status dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: task.status === 'done' ? 'var(--green)' : task.status === 'in_progress' ? 'var(--yellow)' : 'var(--blue)',
                  boxShadow: `0 0 6px ${task.status === 'done' ? 'var(--green)' : task.status === 'in_progress' ? 'var(--yellow)' : 'var(--blue)'}`,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600, fontSize: '0.9rem',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    color: task.status === 'done' ? 'var(--text-3)' : 'var(--text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{task.title}</p>
                  {task.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                    <Badge variant={task.priority}>{task.priority}</Badge>
                    {task.dueDate && (
                      <span style={{
                        fontSize: '0.72rem', color: new Date(task.dueDate) < new Date() ? 'var(--red)' : 'var(--text-3)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {(task.tags || []).map(tag => (
                      <span key={tag} style={{ fontSize: '0.72rem', background: 'var(--bg-3)', color: 'var(--text-3)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(task)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(task._id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <Button variant="ghost" size="sm" disabled={pagination.page <= 1} onClick={() => fetchTasks(pagination.page - 1)}>← Prev</Button>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-2)', fontSize: '0.875rem', padding: '0 12px' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button variant="ghost" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchTasks(pagination.page + 1)}>Next →</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Title" placeholder="What needs to be done?" value={form.title} onChange={setField('title')} error={formErrors.title} />
          <Textarea label="Description" placeholder="Optional details..." value={form.description} onChange={setField('description')} error={formErrors.description} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Status" value={form.status} onChange={setField('status')} options={STATUSES.slice(1)} />
            <Select label="Priority" value={form.priority} onChange={setField('priority')} options={PRIORITIES.slice(1)} />
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={setField('dueDate')} />
          <Input label="Tags (comma-separated)" placeholder="bug, frontend, urgent" value={form.tags} onChange={setField('tags')} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Task" width={360}>
        <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
