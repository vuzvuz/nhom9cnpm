import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Feedback } from '../components/Feedback.jsx';
import { PasswordField } from '../components/Fields.jsx';
import { FormActions, PageHeading } from '../components/Management.jsx';
import { useForm } from '../hooks/useForm.js';
import { authApi } from '../services/mockApi.js';
import { validatePasswordChange } from '../services/validation.js';

const initialValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePassword() {
  const [notice, setNotice] = useState('');
  const form = useForm(initialValues, validatePasswordChange, authApi.changePassword, () => {
    form.reset();
    setNotice('Đã đổi mật khẩu thành công.');
  });

  return (
    <div className="page">
      <PageHeading title="Đổi mật khẩu" description="Cập nhật thông tin đăng nhập cho tài khoản quản trị." />
      <section className="panel password-panel">
        <div className="panel-heading">
          <span className="metric-icon metric-icon--blue"><KeyRound size={22} /></span>
          <div><h2>Mật khẩu tài khoản</h2><p>Mật khẩu mới cần ít nhất 8 ký tự.</p></div>
        </div>
        <form className="password-form" noValidate onSubmit={(event) => { setNotice(''); form.submit(event); }}>
          <Feedback type="success">{notice}</Feedback>
          <Feedback>{form.error}</Feedback>
          <PasswordField label="Mật khẩu hiện tại" autoComplete="current-password" required {...form.field('currentPassword')} />
          <PasswordField label="Mật khẩu mới" autoComplete="new-password" required {...form.field('newPassword')} />
          <PasswordField label="Xác nhận mật khẩu mới" autoComplete="new-password" required {...form.field('confirmPassword')} />
          <FormActions busy={form.busy} label="Đổi mật khẩu" />
        </form>
      </section>
    </div>
  );
}
