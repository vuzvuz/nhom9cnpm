export function PageHeading({ title, description, children }) {
  return (
    <section className="page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {children}
    </section>
  );
}

export function DataTable({ columns, label, children }) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      <table aria-label={label}>
        <thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function FormActions({ busy, onCancel, label }) {
  return (
    <div className="form-actions">
      {onCancel && <button className="button button--secondary" type="button" disabled={busy} onClick={onCancel}>Hủy</button>}
      <button className="button button--primary" type="submit" disabled={busy}>
        {busy ? 'Đang lưu…' : label}
      </button>
    </div>
  );
}
