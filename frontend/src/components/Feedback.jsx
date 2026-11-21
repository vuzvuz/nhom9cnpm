import { AlertCircle, CheckCircle2, Inbox, LoaderCircle } from 'lucide-react';

export function Feedback({ children, type = 'error' }) {
  if (!children) return null;
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div className={`feedback feedback--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <span>{children}</span>
    </div>
  );
}

export function ResourceState({ loading, error, retry, children }) {
  if (loading) {
    return <div className="list-state" role="status"><LoaderCircle className="spinner" size={24} /><p>Đang tải dữ liệu…</p></div>;
  }
  if (error) {
    return (
      <div className="list-state">
        <Feedback>{error}</Feedback>
        <button className="button button--secondary" onClick={retry}>Thử lại</button>
      </div>
    );
  }
  return children;
}

export function EmptyState({ title, description }) {
  return (
    <div className="list-state">
      <span className="empty-icon"><Inbox size={24} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
