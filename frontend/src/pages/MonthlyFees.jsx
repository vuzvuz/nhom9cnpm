import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Feedback, ResourceState } from '../components/Feedback.jsx';
import { money, PeriodField, periodLabel, Status } from '../components/FeeControls.jsx';
import { DataTable, PageHeading } from '../components/Management.jsx';
import { useResources } from '../hooks/useResources.js';
import { applicableFees, feeApi } from '../services/feeApi.js';
import { demoPeriod } from '../data/feeDemo.js';
import { formatNumber } from '../utils/format.js';

const total = (row) => row.lines.reduce((sum, line) => sum + line.amount, 0);

function SheetTable({ sheet, saved }) {
  return <section className="panel">
    <div className="panel-heading"><div><h2>{saved ? 'Bảng phí' : 'Xem trước'} · {periodLabel(sheet.period)}</h2>
      <p>{sheet.rows.length} căn hộ · Tổng phải nộp <strong>{money(sheet.rows.reduce((sum, row) => sum + total(row), 0))}</strong></p></div>
      {saved && <Link className="button button--secondary" to={'/thu-phi?ky=' + sheet.period}>Đến thu phí</Link>}
    </div>
    <DataTable columns={['STT', 'Căn hộ', 'Chủ hộ', 'Diện tích', ...sheet.fees.map((fee) => fee.name), 'Tổng phải nộp', 'Trạng thái']} label="Bảng phí theo căn hộ">
      {sheet.rows.map((row, index) => <tr key={row.householdId}>
        <td>{index + 1}</td><th scope="row"><span className="apartment-tag">{row.apartmentNumber}</span></th>
        <td>{row.headName}</td><td>{formatNumber(row.area)} m²</td>
        {row.lines.map((line) => <td key={line.feeId}>{money(line.amount)}</td>)}
        <td><strong>{money(total(row))}</strong></td><td><Status paid={row.lines.every((line) => line.receipt)} partial={row.lines.some((line) => line.receipt)} /></td>
      </tr>)}
    </DataTable>
  </section>;
}

export default function MonthlyFees() {
  const resource = useResources(feeApi.list);
  const [period, setPeriod] = useState(demoPeriod);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const saved = resource.data?.sheets[period];
  const sheet = saved ?? preview;
  const fees = sheet?.fees ?? applicableFees(resource.data?.catalog ?? [], period);
  function select(value) {
    setPeriod(value); setPreview(null); setNotice(''); setError('');
  }
  async function calculate(save) {
    setBusy(true); setError(''); setNotice('');
    try {
      if (save) {
        const db = await feeApi.generate(period);
        resource.update(() => db);
        setNotice('Đã lập bảng phí tháng ' + periodLabel(period) + '.');
      } else setPreview(await feeApi.preview(period));
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return <div className="page fee-page">
    <PageHeading title="Bảng phí tháng" description="Tính các khoản phí bắt buộc theo diện tích của từng căn hộ." />
    <ResourceState {...resource}>
      <section className="panel fee-settings">
        <PeriodField value={period} disabled={busy} onChange={select} />
        <div><h2>Khoản phí áp dụng</h2>
          {fees.length ? <ul className="fee-rates">{fees.map((fee) => <li key={fee.id}>{fee.name} <strong>{money(fee.rate)}/m²/tháng</strong></li>)}</ul>
            : <p className="field-hint">Chưa có khoản phí bắt buộc cho kỳ này. <Link to="/khoan-thu">Mở danh mục khoản thu</Link></p>}
        </div>
        <div className="fee-buttons">
          <button className="button button--secondary" disabled={busy || !!saved || !period || !fees.length} onClick={() => calculate(false)}>Xem trước bảng phí</button>
          <button className="button button--primary" disabled={busy || !!saved || !period || !fees.length} onClick={() => calculate(true)}>{busy ? 'Đang tính phí…' : saved ? 'Đã lập bảng phí' : 'Lập bảng phí tháng'}</button>
        </div>
      </section>
      <Feedback>{error}</Feedback><Feedback type="success">{notice}</Feedback>
      {sheet ? <SheetTable sheet={sheet} saved={!!saved} /> : <section className="panel"><EmptyState title="Chưa lập bảng phí" description="Chọn kỳ thu có đơn giá áp dụng để xem trước số tiền từng căn hộ." /></section>}
    </ResourceState>
  </div>;
}
