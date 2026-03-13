import { useState } from 'react';

// ── Button ──────────────────────────────────────────────────────────────────
export const Button = ({
  children, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, onClick, type = 'button', style,
}) => {
  const styles = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', border: 'none', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-display)', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition)', opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...(size === 'sm' && { padding: '6px 14px', fontSize: '0.8rem' }),
    ...(size === 'md' && { padding: '10px 20px', fontSize: '0.875rem' }),
    ...(size === 'lg' && { padding: '13px 28px', fontSize: '1rem' }),
    ...(variant === 'primary' && {
      background: 'var(--accent)', color: '#fff',
      boxShadow: '0 0 20px var(--accent-glow-strong)',
    }),
    ...(variant === 'secondary' && {
      background: 'var(--surface-2)', color: 'var(--text)',
      border: '1px solid var(--border)',
    }),
    ...(variant === 'ghost' && {
      background: 'transparent', color: 'var(--text-2)',
      border: '1px solid var(--border)',
    }),
    ...(variant === 'danger' && {
      background: 'var(--red-dim)', color: 'var(--red)',
      border: '1px solid var(--red)',
    }),
    ...(variant === 'success' && {
      background: 'var(--green-dim)', color: 'var(--green)',
      border: '1px solid var(--green)',
    }),
    ...style,
  };

  return (
    <button type={type} style={styles} onClick={onClick} disabled={disabled || loading}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

// ── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, icon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '0.875rem', pointerEvents: 'none' }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        style={{
          width: '100%', padding: icon ? '11px 14px 11px 38px' : '11px 14px',
          background: 'var(--bg-3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: '0.9rem',
          outline: 'none', transition: 'var(--transition)',
          ...props.style,
        }}
        onFocus={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'; e.target.style.boxShadow = `0 0 0 3px ${error ? 'var(--red-dim)' : 'var(--accent-glow)'}`; props.onFocus?.(e); }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; e.target.style.boxShadow = 'none'; props.onBlur?.(e); }}
      />
    </div>
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ label, error, options = [], ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <select
      {...props}
      style={{
        width: '100%', padding: '11px 14px', background: 'var(--bg-3)',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', color: 'var(--text)',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
        cursor: 'pointer', ...props.style,
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <textarea
      {...props}
      style={{
        width: '100%', padding: '11px 14px', background: 'var(--bg-3)',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', color: 'var(--text)',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
        resize: 'vertical', minHeight: 90, transition: 'var(--transition)',
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
    />
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onClick, hoverable }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px',
      transition: hoverable ? 'var(--transition)' : undefined,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}
    onMouseEnter={hoverable ? (e) => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
    onMouseLeave={hoverable ? (e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; } : undefined}
  >
    {children}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
    todo: { bg: 'var(--blue-dim)', color: 'var(--blue)', border: 'var(--blue)' },
    in_progress: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'var(--yellow)' },
    done: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'var(--green)' },
    high: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'var(--red)' },
    medium: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'var(--yellow)' },
    low: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'var(--green)' },
    admin: { bg: 'var(--accent-glow)', color: 'var(--accent-2)', border: 'var(--accent)' },
    user: { bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
      fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      textTransform: 'capitalize',
    }}>
      {children}
    </span>
  );
};

// ── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = 'var(--accent)' }) => (
  <div style={{
    width: size, height: size, border: `2px solid transparent`,
    borderTopColor: color, borderRightColor: color,
    borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0,
  }} />
);

// ── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, width = 480 }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-in" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: width,
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📋', title, description, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '3rem', marginBottom: 16 }}>{icon}</div>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
    {description && <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: 24 }}>{description}</p>}
    {action}
  </div>
);
