import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, Feedback, ResourceState } from '../components/Feedback.jsx';
import { dateLabel, money, PeriodField, periodLabel, SearchField, Status } from '../components/FeeControls.jsx';
import { SelectField } from '../components/Fields.jsx';
import { DataTable, FormActions, PageHeading } from '../components/Management.jsx';
import Modal from '../components/Modal.jsx';
import { demoPeriod } from '../data/feeDemo.js';
import { useResources } from '../hooks/useResources.js';
import { feeApi } from '../services/feeApi.js';
import { searchText } from '../utils/format.js';

export default function Collections({ user }) {
  const resource = useResources(feeApi.list);
  const [params] = useSearchParams();
  const [period, setPeriod] = useState(params.get('ky') || demoPeriod);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const sheet = resource.data?.sheets[period];
  const names = new Map(sheet?.fees.map((fee) => [fee.id, fee.name]));
  const term = searchText(query.trim());
  const items = (sheet?.rows ?? []).filter((row) => searchText(row.apartmentNumber + ' ' + row.headName).includes(term))
    .flatMap((row) => row.lines.filter((line) => !status || status === (line.receipt ? 'paid' : 'unpaid'))
      .map((line) => ({ row, line, name: names.get(line.feeId) })));

  async function confirm(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const { row, line, name } = selected;
      const db = await feeApi.collect(period, row.householdId, line.feeId);
      resource.update(() => db);
      setNotice('Đã thu ' + money(line.amount) + ' cho ' + name + ' của căn hộ ' + row.apartmentNumber + '.');
      setSelected(null);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <div className="page fee-page">
    <PageHeading title="Xác nhận thu phí" description="Tra cứu khoản phải nộp và ghi nhận tiền mặt theo từng căn hộ." />
    <Feedback type="success">{notice}</Feedback>
    <section className="panel">
      <div className="panel-heading fee-toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="Tìm căn hộ hoặc chủ hộ" />
        <PeriodField value={period} onChange={(value) => { setPeriod(value); setNotice(''); }} />
        <SelectField id="payment-filter" label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option><option value="unpaid">Chưa nộp</option><option value="paid">Đã nộp</option>
        </SelectField>
      </div>
      <ResourceState {...resource}>
        {items.length ? <DataTable columns={['Căn hộ / Chủ hộ', 'Khoản thu', 'Phải nộp', 'Trạng thái', 'Thông tin thu', 'Thao tác']} label="Các khoản phí của căn hộ">
          {items.map((item) => {
            const { row, line, name } = item;
            return <tr key={row.householdId + '/' + line.feeId}>
              <th scope="row"><span className="apartment-tag">{row.apartmentNumber}</span><small>{row.headName}</small></th>
              <td>{name}<small>{periodLabel(period)}</small></td><td>{money(line.amount)}</td><td><Status paid={!!line.receipt} /></td>
              <td>{line.receipt ? <>{dateLabel(line.receipt.date)} · {line.receipt.method}<small>{line.receipt.collector}</small></> : '—'}</td>
              <td><button className="button button--secondary" disabled={!!line.receipt} onClick={() => { setSelected(item); setError(''); setNotice(''); }}>{line.receipt ? 'Đã xác nhận' : 'Xác nhận đã thu'}</button></td>
            </tr>;
          })}
        </DataTable> : <EmptyState title={sheet ? 'Không tìm thấy khoản phí' : 'Chưa có bảng phí kỳ này'} description={sheet ? 'Thử đổi từ khóa hoặc trạng thái thanh toán.' : 'Lập bảng phí tháng trước khi xác nhận thu tiền.'} />}
      </ResourceState>
    </section>
    {selected && <Modal title="Xác nhận đã thu" description="Đối chiếu thông tin với số tiền mặt đã nhận." busy={busy} onClose={() => setSelected(null)}>
      <form className="modal-form" onSubmit={confirm}>
        <dl className="fee-detail">
          {Object.entries({ 'Căn hộ': selected.row.apartmentNumber, 'Chủ hộ': selected.row.headName, 'Khoản thu': selected.name,
            'Kỳ thu': periodLabel(period), 'Số tiền': money(selected.line.amount), 'Trạng thái': 'Chưa nộp',
            'Ngày thu': dateLabel(new Date()), 'Người thu': user.name, 'Phương thức': 'Tiền mặt' }).map(([label, value]) =>
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <Feedback>{error}</Feedback>
        <FormActions busy={busy} label="Xác nhận đã thu" onCancel={() => setSelected(null)} />
      </form>
    </Modal>}
  </div>;
}
