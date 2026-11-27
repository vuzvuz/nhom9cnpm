import { useEffect, useRef } from 'react';
import { Banknote, Building2, CalendarDays, KeyRound, LayoutDashboard, List, LogOut, Menu, Users, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Brand from './Brand.jsx';

const mainLinks = [
  { path: '/', label: 'Tổng quan', Icon: LayoutDashboard },
  { path: '/ho-gia-dinh', label: 'Hộ gia đình', Icon: Building2 },
  { path: '/nhan-khau', label: 'Nhân khẩu', Icon: Users },
];
const passwordLink = { path: '/doi-mat-khau', label: 'Đổi mật khẩu', Icon: KeyRound };
const feeLinks = [
  { path: '/khoan-thu', label: 'Danh mục khoản thu', Icon: List },
  { path: '/bang-phi', label: 'Bảng phí tháng', Icon: CalendarDays },
  { path: '/thu-phi', label: 'Xác nhận thu phí', Icon: Banknote },
];

function NavigationLink({ link: { path, label, Icon }, onClick }) {
  return (
    <NavLink to={path} end={path === '/'} onClick={onClick} className="nav-link">
      <Icon size={19} /><span>{label}</span>
    </NavLink>
  );
}

function Sidebar({ onLogout, onNavigate, mobile = false }) {
  return (
    <div className="sidebar-content">
      <div className="sidebar-brand">
        <Brand />
        {mobile && <button className="icon-button sidebar-close" onClick={onNavigate} aria-label="Đóng menu"><X size={22} /></button>}
      </div>
      <nav aria-label="Điều hướng chính">
        <div className="nav-label">QUẢN LÝ</div>
        {mainLinks.map((link) => <NavigationLink key={link.path} link={link} onClick={onNavigate} />)}
        <div className="nav-label nav-label--second">THU PHÍ</div>
        {feeLinks.map((link) => <NavigationLink key={link.path} link={link} onClick={onNavigate} />)}
        <div className="nav-label nav-label--second">TÀI KHOẢN</div>
        <NavigationLink link={passwordLink} onClick={onNavigate} />
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-link logout" onClick={onLogout}><LogOut size={19} /> Đăng xuất</button>
      </div>
    </div>
  );
}

export default function AppLayout({ user, onLogout }) {
  const { pathname } = useLocation();
  const menu = useRef(null);
  const current = [...mainLinks, ...feeLinks, passwordLink].find((item) => item.path === pathname);
  const closeMenu = () => menu.current?.close();

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 861px)');
    const closeOnDesktop = (event) => { if (event.matches) menu.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Chuyển đến nội dung</a>
      <aside className="sidebar"><Sidebar onLogout={onLogout} /></aside>
      <dialog className="mobile-menu" ref={menu} aria-label="Menu quản trị">
        <Sidebar onLogout={onLogout} onNavigate={closeMenu} mobile />
      </dialog>
      <div className="app-body">
        <header className="topbar">
          <div className="topbar-location">
            <button className="icon-button menu-trigger" onClick={() => menu.current.showModal()} aria-label="Mở menu">
              <Menu size={23} />
            </button>
            <span>Cổng quản trị</span><span className="breadcrumb-divider">/</span><strong>{current?.label}</strong>
          </div>
          <div className="user-profile">
            <div className="avatar" aria-hidden="true">QT</div>
            <div><strong>{user.name}</strong><span>{user.username}</span></div>
          </div>
        </header>
        <main className="content" id="main-content" tabIndex={-1}><Outlet /></main>
      </div>
    </div>
  );
}
