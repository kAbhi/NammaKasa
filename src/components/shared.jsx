import React from 'react';
import { Trash2 } from 'lucide-react';

export function Logo({ size = 'md' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  return (
    <div className={`flex items-center gap-2 font-bold ${sizes[size]}`}>
      <div className="bg-green-600 text-white p-1.5 rounded-xl">
        <Trash2 size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      </div>
      <span className="text-gray-900">Namma<span className="text-green-600">Parisara</span></span>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    ready: { label: 'Ready', cls: 'badge-green' },
    collected: { label: 'Collected', cls: 'badge-green' },
    pending: { label: 'Pending', cls: 'badge-yellow' },
    in_progress: { label: 'In Progress', cls: 'badge-blue' },
    missed: { label: 'Missed', cls: 'badge-red' },
    cancelled: { label: 'Cancelled', cls: 'badge-gray' },
    open: { label: 'Open', cls: 'badge-red' },
    in_review: { label: 'In Review', cls: 'badge-yellow' },
    resolved: { label: 'Resolved', cls: 'badge-green' },
    not_started: { label: 'Not Started', cls: 'badge-gray' },
    completed: { label: 'Completed', cls: 'badge-green' },
    upcoming: { label: 'Upcoming', cls: 'badge-blue' },
    active: { label: 'Active', cls: 'badge-green' },
    high: { label: 'High', cls: 'badge-red' },
    medium: { label: 'Medium', cls: 'badge-yellow' },
    low: { label: 'Low', cls: 'badge-blue' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'badge-gray' };
  return <span className={cls}>{label}</span>;
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 p-4 rounded-2xl mb-3">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffH = diffMs / 3600000;
  if (diffH < 1) return `${Math.round(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatFullDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

export function MiniBar({ value, max, color = 'bg-green-500' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}
