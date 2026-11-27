import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { EmptyState, Feedback, ResourceState } from '../components/Feedback.jsx';
import { feeType, money, periodLabel, SearchField } from '../components/FeeControls.jsx';
import { InputField, SelectField } from '../components/Fields.jsx';
import { DataTable, FormActions, PageHeading } from '../components/Management.jsx';
import Modal from '../components/Modal.jsx';
import { useForm } from '../hooks/useForm.js';
import { useResources } from '../hooks/useResources.js';
import { feeApi, validateFee } from '../services/feeApi.js';
import { searchText } from '../utils/format.js';

const blank = { name: '', type: 'required', rate: '', start: '', end: '', note: '' };

function TypeOptions() {
  return <><option value="required">Bắt buộc</option><option value="voluntary">Tự nguyện</option></>;
}

function FeeForm({ fee, catalog, onClose, onSaved }) {
  const form = useForm({ ...fee, rate: fee.rate ?? '' }, (values) => validateFee(values, catalog), feeApi.saveFee, onSaved);
  return <Modal title={fee.id ? 'Chỉnh sửa khoản thu' : 'Thêm khoản thu'} description="Đơn giá được áp dụng khi lập bảng phí tháng." onClose={onClose} busy={form.busy}>
    <form className="modal-form" onSubmit={form.submit} noValidate>
      <Feedback>{form.error}</Feedback>
      <InputField label="Tên khoản thu" placeholder="Ví dụ Phí dịch vụ chung cư" required {...form.field('name')} />
      <SelectField label="Loại khoản thu" {...form.field('type')}><TypeOptions /></SelectField>
      {form.field('type').value === 'required'
        ? <InputField label="Đơn giá (VNĐ/m²/tháng)" type="number" placeholder="10000" required {...form.field('rate')} />
        : <p className="field-hint">Cư dân tự chọn mức đóng góp. Khoản này được loại khỏi bảng phí tháng.</p>}
      <div className="form-grid">
        <InputField label="Từ tháng" type="month" {...form.field('start')} />
        <InputField label="Đến hết tháng" type="month" {...form.field('end')} />
      </div>
      <InputField label="Ghi chú" placeholder="Nội dung khoản thu (nếu có)" {...form.field('note')} />
      <FormActions busy={form.busy} onCancel={onClose} label="Lưu khoản thu" />
    </form>
  </Modal>;
}

export default function FeeCatalog() {
  const resource = useResources(feeApi.list);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [edit, setEdit] = useState(null);
  const [notice, setNotice] = useState('');
  const catalog = resource.data?.catalog ?? [];
  const filtered = catalog.filter((fee) => (!type || fee.type === type) && searchText(fee.id + ' ' + fee.name).includes(searchText(query.trim())));

  function saved(db) {
    resource.update(() => db);
    setNotice(edit.id ? 'Đã cập nhật khoản thu.' : 'Đã thêm khoản thu.');
    setQuery(''); setType(''); setEdit(null);
  }

  return <div className="page fee-page">
    <PageHeading title="Danh mục khoản thu" description="Thiết lập đơn giá phí chung cư và các đợt vận động đóng góp.">
      <button className="button button--primary" disabled={!resource.data} onClick={() => setEdit(blank)}><Plus size={18} /> Thêm khoản thu</button>
    </PageHeading>
    <Feedback type="success">{notice}</Feedback>
    <section className="panel">
      <div className="panel-heading fee-toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="Tìm mã hoặc tên khoản thu" />
        <SelectField id="fee-type-filter" label="Loại khoản thu" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tất cả loại</option><TypeOptions />
        </SelectField>
      </div>
      <ResourceState {...resource}>
        {filtered.length ? <DataTable label="Danh sách khoản thu" columns={['Mã', 'Tên khoản thu', 'Loại', 'Đơn giá / m² / tháng', 'Thời gian áp dụng', 'Thao tác']}>
          {filtered.map((fee) => <tr key={fee.id}>
            <td>{fee.id}</td><th scope="row">{fee.name}</th><td>{feeType(fee.type)}</td>
            <td>{fee.rate === null ? 'Tùy tâm' : money(fee.rate)}</td>
            <td>{fee.start || fee.end ? [fee.start && 'Từ ' + periodLabel(fee.start), fee.end && 'đến ' + periodLabel(fee.end)].filter(Boolean).join(' ') : 'Mọi kỳ'}</td>
            <td><button className="icon-button" aria-label={'Sửa ' + fee.name} onClick={() => setEdit(fee)}><Pencil size={16} /></button></td>
          </tr>)}
        </DataTable> : <EmptyState title="Không có khoản thu phù hợp" description="Thử đổi bộ lọc hoặc thêm khoản thu." />}
        <div className="table-footer">{filtered.length} khoản thu</div>
      </ResourceState>
    </section>
    {edit && <FeeForm fee={edit} catalog={catalog} onClose={() => setEdit(null)} onSaved={saved} />}
  </div>;
}
