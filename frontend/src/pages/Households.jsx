import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, Feedback, ResourceState } from '../components/Feedback.jsx';
import { InputField } from '../components/Fields.jsx';
import HouseholdTable from '../components/HouseholdTable.jsx';
import { FormActions, PageHeading } from '../components/Management.jsx';
import Modal from '../components/Modal.jsx';
import { useForm } from '../hooks/useForm.js';
import { useResources } from '../hooks/useResources.js';
import { householdApi } from '../services/mockApi.js';
import { validateHousehold } from '../services/validation.js';
import { searchText } from '../utils/format.js';

const initialValues = { apartmentNumber: '', headName: '', area: '' };

function HouseholdForm({ households, onClose, onSaved }) {
  const form = useForm(initialValues, (values) => validateHousehold(values, households), householdApi.create, onSaved);

  return (
    <Modal title="Thêm hộ gia đình" description="Nhập thông tin căn hộ và chủ hộ." onClose={onClose} busy={form.busy}>
      <form className="modal-form" onSubmit={form.submit} noValidate>
        <Feedback>{form.error}</Feedback>
        <InputField label="Số căn hộ" placeholder="Ví dụ A-101" required {...form.field('apartmentNumber')} />
        <InputField label="Diện tích (m²)" placeholder="Ví dụ 72,5" type="number" step="any" required {...form.field('area')} />
        <InputField label="Họ tên chủ hộ" placeholder="Nhập họ tên" required {...form.field('headName')} />
        <FormActions busy={form.busy} onCancel={onClose} label="Thêm hộ gia đình" />
      </form>
    </Modal>
  );
}

export default function Households() {
  const resources = useResources(householdApi.list);
  const households = resources.data ?? [];
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const term = searchText(query.trim());
  const filtered = households.filter((item) =>
    [item.apartmentNumber, item.headName].some((value) => searchText(value).includes(term)));

  function handleSaved(household) {
    resources.update((current) => [household, ...current]);
    setQuery('');
    setAdding(false);
    setNotice(`Đã thêm hộ gia đình cho căn hộ ${household.apartmentNumber}.`);
  }

  return (
    <div className="page">
      <PageHeading title="Quản lý hộ gia đình" description="Tra cứu và ghi nhận thông tin căn hộ, diện tích và chủ hộ.">
        <button className="button button--primary" disabled={!resources.data} onClick={() => { setNotice(''); setAdding(true); }}>
          <Plus size={19} /> Thêm hộ gia đình
        </button>
      </PageHeading>
      <Feedback type="success">{notice}</Feedback>
      <section className="panel">
        <div className="panel-heading list-heading">
          <div><h2>Danh sách hộ gia đình</h2><p>{households.length} hộ gia đình</p></div>
          <label className="search-box">
            <Search size={18} />
            <input aria-label="Tìm theo số căn hộ hoặc chủ hộ" placeholder="Tìm căn hộ hoặc chủ hộ" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        <ResourceState {...resources}>
          {filtered.length ? <HouseholdTable households={filtered} /> : (
            <EmptyState title={term ? 'Không tìm thấy hộ gia đình' : 'Chưa có hộ gia đình'} description={term ? 'Thử số căn hộ hoặc tên chủ hộ khác.' : 'Thêm hộ gia đình để bắt đầu quản lý.'} />
          )}
        </ResourceState>
        {resources.data && <div className="table-footer">Hiển thị {filtered.length} / {households.length} hộ gia đình</div>}
      </section>
      {adding && <HouseholdForm households={households} onClose={() => setAdding(false)} onSaved={handleSaved} />}
    </div>
  );
}
