import { Info } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import { Feedback } from '../components/Feedback.jsx';
import { InputField, PasswordField } from '../components/Fields.jsx';
import Skyline from '../components/Skyline.jsx';
import { useForm } from '../hooks/useForm.js';
import { authApi, demoCredentials } from '../services/mockApi.js';
import { validateLogin } from '../services/validation.js';

const initialValues = { username: '', password: '' };

export default function Login({ onLogin }) {
  const form = useForm(initialValues, validateLogin, authApi.login, onLogin);

  return (
    <main className="login">
      <section className="login-brand-panel">
        <Brand />
        <div className="login-intro">
          <h2>Cổng quản trị<br />chung cư BlueMoon</h2>
          <p>Tra cứu và cập nhật thông tin hộ gia đình, nhân khẩu tại chung cư BlueMoon.</p>
        </div>
        <Skyline />
      </section>
      <section className="login-main">
        <div className="login-form-wrap">
          <div className="mobile-brand"><Brand /></div>
          <h1>Đăng nhập</h1>
          <p className="page-description">Sử dụng tài khoản quản trị để truy cập hệ thống.</p>
          <form className="login-form" onSubmit={form.submit} noValidate>
            <Feedback>{form.error}</Feedback>
            <InputField label="Tên đăng nhập" placeholder="Nhập tên đăng nhập" autoComplete="username" required {...form.field('username')} />
            <PasswordField label="Mật khẩu" placeholder="Nhập mật khẩu" autoComplete="current-password" required {...form.field('password')} />
            <button className="button button--primary" disabled={form.busy} type="submit">
              {form.busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
          <div className="demo-note">
            <Info size={20} />
            <div><strong>Tài khoản demo</strong><p>Tên đăng nhập <code>{demoCredentials.username}</code></p><p>Mật khẩu <code>{demoCredentials.password}</code></p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
