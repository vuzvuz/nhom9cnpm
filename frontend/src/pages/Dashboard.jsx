import { Building2, CalendarDays, KeyRound, Maximize, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ResourceState } from '../components/Feedback.jsx';
import HouseholdTable from '../components/HouseholdTable.jsx';
import { PageHeading } from '../components/Management.jsx';
import Skyline from '../components/Skyline.jsx';
import { useResources } from '../hooks/useResources.js';
import { householdApi, residentApi } from '../services/mockApi.js';
import { formatNumber, formatToday } from '../utils/format.js';

async function loadDashboard() {
  const [households, residents] = await Promise.all([householdApi.list(), residentApi.list()]);
  return { households, residents };
}

const quickLinks = [
  { href: '/ho-gia-dinh', Icon: Building2, name: 'Hộ gia đình', description: 'Tra cứu và thêm hộ gia đình', tone: 'blue' },
  { href: '/nhan-khau', Icon: Users, name: 'Nhân khẩu', description: 'Thêm và cập nhật nhân khẩu', tone: 'violet' },
  { href: '/doi-mat-khau', Icon: KeyRound, name: 'Đổi mật khẩu', description: 'Cập nhật mật khẩu tài khoản', tone: 'teal' },
];

function MetricCard({ Icon, tone, label, value, unit }) {
  return (
    <article className="panel metric">
      <span className={`metric-icon metric-icon--${tone}`}><Icon size={22} /></span>
      <div><p>{label}</p><strong>{formatNumber(value)} {unit && <small>{unit}</small>}</strong></div>
    </article>
  );
}

export default function Dashboard() {
  const resources = useResources(loadDashboard);
  const { data } = resources;

  return (
    <div className="page">
      <PageHeading title="Tổng quan" description="Theo dõi thông tin quản lý chung cư BlueMoon.">
        <div className="date-chip"><CalendarDays size={17} /> {formatToday()}</div>
      </PageHeading>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <h2>Chào mừng đến với BlueMoon</h2>
          <p>Quản lý hộ gia đình và cập nhật hồ sơ nhân khẩu tại một nơi.</p>
        </div>
        <Skyline />
      </section>
      <ResourceState {...resources}>
        {data && (
          <>
            <section className="metrics" aria-label="Số liệu tổng quan">
              <MetricCard Icon={Building2} tone="blue" label="Hộ gia đình" value={data.households.length} />
              <MetricCard Icon={Users} tone="violet" label="Nhân khẩu" value={data.residents.length} />
              <MetricCard Icon={Maximize} tone="teal" label="Tổng diện tích" value={Number(data.households.reduce((sum, item) => sum + item.area, 0).toPrecision(15))} unit="m²" />
            </section>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-heading">
                  <div><h2>Hộ gia đình gần đây</h2><p>Các hộ mới nhất trong danh sách quản lý.</p></div>
                  <Link className="button button--secondary" to="/ho-gia-dinh">Xem tất cả</Link>
                </div>
                {data.households.length
                  ? <HouseholdTable households={data.households.slice(0, 4)} />
                  : <EmptyState title="Chưa có hộ gia đình" description="Thêm hộ gia đình để bắt đầu quản lý." />}
              </section>
              <section className="panel">
                <div className="panel-heading"><div><h2>Truy cập nhanh</h2></div></div>
                <div className="quick-links">
                  {quickLinks.map(({ href, Icon, name, description, tone }) => (
                    <Link key={href} className="quick-link" to={href}>
                      <span className={`metric-icon metric-icon--${tone}`}><Icon size={19} /></span>
                      <span><strong>{name}</strong><small>{description}</small></span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </ResourceState>
    </div>
  );
}
