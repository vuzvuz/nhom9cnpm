import { relationships } from '../data/mockData.js';

export function dateInputValue(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function ageFromBirthDate(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000') || value > dateInputValue(today)) {
    return null;
  }

  const birth = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== value) {
    return null;
  }

  const birthdayPassed = value.slice(5) <= dateInputValue(today).slice(5);
  return today.getFullYear() - birth.getUTCFullYear() - (birthdayPassed ? 0 : 1);
}

export function validateHousehold(values, households) {
  const errors = {};
  const apartmentNumber = values.apartmentNumber.trim().toUpperCase();

  if (!apartmentNumber) errors.apartmentNumber = 'Vui lòng nhập số căn hộ.';
  else if (households.some((item) => item.apartmentNumber.toUpperCase() === apartmentNumber)) {
    errors.apartmentNumber = 'Số căn hộ này đã tồn tại.';
  }
  if (!Number.isFinite(Number(values.area)) || Number(values.area) <= 0) {
    errors.area = 'Diện tích phải lớn hơn 0.';
  }
  if (!values.headName.trim()) errors.headName = 'Vui lòng nhập họ tên chủ hộ.';

  return errors;
}

export function validateResident(values, households) {
  const errors = {};
  const age = ageFromBirthDate(values.birthDate);
  const nationalId = values.nationalId.trim();

  if (!values.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên.';
  if (age === null) errors.birthDate = 'Vui lòng nhập ngày sinh hợp lệ, không sau hôm nay.';
  if (nationalId && !/^\d{12}$/.test(nationalId)) errors.nationalId = 'CCCD phải gồm đúng 12 chữ số.';
  else if (!nationalId && age !== null && age >= 14) {
    errors.nationalId = 'Người từ 14 tuổi phải có CCCD.';
  }
  if (!relationships.includes(values.relationship)) errors.relationship = 'Vui lòng chọn quan hệ với chủ hộ.';
  if (!households.some((item) => item.id === values.householdId)) errors.householdId = 'Vui lòng chọn căn hộ.';

  return errors;
}

export function validateLogin({ username, password }) {
  const errors = {};
  if (!username.trim()) errors.username = 'Vui lòng nhập tên đăng nhập.';
  if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  if (newPassword.length < 8) errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
  else if (newPassword === currentPassword) errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  if (!confirmPassword || newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận phải trùng với mật khẩu mới.';
  }
  return errors;
}
