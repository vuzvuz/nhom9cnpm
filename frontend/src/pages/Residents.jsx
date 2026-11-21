import { Pencil, Plus, UserRound } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, Feedback, ResourceState } from '../components/Feedback.jsx';
import { InputField, SelectField } from '../components/Fields.jsx';
import { DataTable, FormActions, PageHeading } from '../components/Management.jsx';
import Modal from '../components/Modal.jsx';
import { relationships } from '../data/mockData.js';
import { useForm } from '../hooks/useForm.js';
import { useResources } from '../hooks/useResources.js';
import { householdApi, residentApi } from '../services/mockApi.js';
import { dateInputValue, validateResident } from '../services/validation.js';
import { formatBirthDate } from '../utils/format.js';

const initialValues = { fullName: '', birthDate: '', nationalId: '', relationship: '', householdId: '' };

async function loadResidents() {
  const [households, residents] = await Promise.all([householdApi.list(), residentApi.list()]);
  return { households, residents };
}

function ApartmentOptions({ households }) {
  return households.map((item) => <option key={item.id} value={item.id}>{item.apartmentNumber}</option>);
}

function ResidentForm({ resident, households, onClose, onSaved }) {
  const title = resident.id ? 'Sửa nhân khẩu' : 'Thêm nhân khẩu';
  const form = useForm(resident, (values) => validateResident(values, households), (values) => residentApi.save(values, resident.id), onSaved);

  return (
    <Modal title={title} description="Cập nhật thông tin cá nhân và căn hộ đang cư trú." onClose={onClose} busy={form.busy}>
      <form className="modal-form" onSubmit={form.submit} noValidate>
        <Feedback>{form.error}</Feedback>
        <InputField label="Họ và tên" placeholder="Nhập họ tên" required {...form.field('fullName')} />
        <div className="form-grid">
          <InputField label="Ngày sinh" type="date" max={dateInputValue()} required {...form.field('birthDate')} />
          <SelectField label="Căn hộ" required {...form.field('householdId')}>
            <option value="">Chọn căn hộ</option>
            <ApartmentOptions households={households} />
          </SelectField>
        </div>
        <InputField label="CCCD" hint="Người dưới 14 tuổi có thể để trống." placeholder="Nhập 12 chữ số" inputMode="numeric" {...form.field('nationalId')} />
        <SelectField label="Quan hệ với chủ hộ" required {...form.field('relationship')}>
          <option value="">Chọn quan hệ</option>
          {relationships.map((item) => <option key={item} value={item}>{item}</option>)}
        </SelectField>
        <FormActions busy={form.busy} onCancel={onClose} label={resident.id ? 'Lưu thay đổi' : title} />
      </form>
    </Modal>
  );
}

export default function Residents() {
  const resources = useResources(loadResidents);
  const { households, residents } = resources.data ?? { households: [], residents: [] };
  const [apartment, setApartment] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const apartmentNumbers = new Map(households.map((item) => [item.id, item.apartmentNumber]));
  const filtered = apartment ? residents.filter((item) => item.householdId === apartment) : residents;

  function openForm(resident) {
    setNotice('');
    setEditing(resident);
  }

  function handleSaved(resident) {
    const isUpdate = Boolean(editing.id);
    resources.update((current) => ({
      ...current,
      residents: isUpdate
        ? current.residents.map((item) => item.id === resident.id ? resident : item)
        : [resident, ...current.residents],
    }));
    if (apartment && apartment !== resident.householdId) setApartment(resident.householdId);
    setEditing(null);
    setNotice(isUpdate ? `Đã cập nhật hồ sơ ${resident.fullName}.` : `Đã thêm nhân khẩu ${resident.fullName}.`);
  }

  return (
    <div className="page">
      <PageHeading title="Quản lý nhân khẩu" description="Xem và cập nhật hồ sơ cư dân theo từng căn hộ.">
        <button className="button button--primary" disabled={!households.length} onClick={() => openForm({ ...initialValues, householdId: apartment })}>
          <Plus size={19} /> Thêm nhân khẩu
        </button>
      </PageHeading>
      <Feedback type="success">{notice}</Feedback>
      <section className="panel">
        <div className="panel-heading list-heading">
          <div><h2>Danh sách nhân khẩu</h2><p>{residents.length} nhân khẩu</p></div>
          <select aria-label="Lọc theo căn hộ" value={apartment} onChange={(event) => setApartment(event.target.value)}>
            <option value="">Tất cả căn hộ</option>
            <ApartmentOptions households={households} />
          </select>
        </div>
        <ResourceState {...resources}>
          {filtered.length ? (
            <DataTable label="Danh sách nhân khẩu" columns={['Họ và tên', 'Ngày sinh', 'CCCD', 'Quan hệ với chủ hộ', 'Căn hộ', 'Thao tác']}>
              {filtered.map((resident) => (
                <tr key={resident.id}>
                  <th scope="row"><div className="cell-leading"><span className="table-icon"><UserRound size={17} /></span>{resident.fullName}</div></th>
                  <td>{formatBirthDate(resident.birthDate)}</td>
                  <td>{resident.nationalId || '—'}</td>
                  <td>{resident.relationship}</td>
                  <td><span className="apartment-tag">{apartmentNumbers.get(resident.householdId) ?? '—'}</span></td>
                  <td>
                    <button className="icon-button edit-button" onClick={() => openForm(resident)} aria-label={`Sửa ${resident.fullName}`}>
                      <Pencil size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState title="Chưa có nhân khẩu" description={apartment ? 'Căn hộ này chưa có hồ sơ nhân khẩu.' : 'Thêm nhân khẩu để bắt đầu quản lý hồ sơ cư dân.'} />
          )}
        </ResourceState>
        {resources.data && <div className="table-footer">Hiển thị {filtered.length} / {residents.length} nhân khẩu</div>}
      </section>
      {editing && <ResidentForm resident={editing} households={households} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  );
}
