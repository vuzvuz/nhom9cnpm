const numberFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 20 });
const longDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

export const formatNumber = (value) => numberFormatter.format(value);
export const formatToday = () => longDateFormatter.format(new Date());
export const formatBirthDate = (value) => value.split('-').reverse().join('/');

export function searchText(value) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll('đ', 'd');
}
