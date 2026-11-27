import { Search } from 'lucide-react';
import { InputField } from './Fields.jsx';
import { formatNumber } from '../utils/format.js';

export const money = (value) => formatNumber(value) + ' ₫';
export const periodLabel = (period) => period.split('-').reverse().join('/');
export const dateLabel = (value) => new Date(value).toLocaleDateString('vi-VN');
export const feeType = (type) => type === 'required' ? 'Bắt buộc' : 'Tự nguyện';

export function PeriodField({ value, onChange, disabled }) {
  return <InputField id="fee-period" label="Kỳ thu" type="month" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

export function SearchField({ value, onChange, placeholder }) {
  return <label className="search-box"><Search size={18} />
    <input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>;
}

export function Status({ paid, partial }) {
  const label = paid ? 'Đã nộp' : partial ? 'Đã nộp một phần' : 'Chưa nộp';
  return <span className={'fee-status' + (paid ? ' paid' : '')}>{label}</span>;
}
