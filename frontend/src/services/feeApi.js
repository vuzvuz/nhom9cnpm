import { sampleFees } from '../data/feeDemo.js';
import { authApi, householdApi } from './mockApi.js';
import { searchText } from '../utils/format.js';

const key = 'bluemoon-sprint2-fees-v1';
const validPeriod = (value) => /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value);
const normalized = (name) => searchText(name.trim().replace(/\s+/g, ' '));

export function validateFee(fee, catalog) {
  const errors = {};
  if (!fee.name.trim()) errors.name = 'Nhập tên khoản thu.';
  else if (catalog.some((item) => item.id !== fee.id && normalized(item.name) === normalized(fee.name))) {
    errors.name = 'Tên khoản thu đã tồn tại.';
  }
  if (fee.type === 'required' && !(Number.isSafeInteger(Number(fee.rate)) && Number(fee.rate) > 0)) {
    errors.rate = 'Nhập đơn giá nguyên dương theo VNĐ.';
  }
  if (fee.start && !validPeriod(fee.start)) errors.start = 'Kỳ bắt đầu không hợp lệ.';
  if (fee.end && (!validPeriod(fee.end) || fee.end < fee.start)) errors.end = 'Kiểm tra lại kỳ kết thúc.';
  return errors;
}

export function applicableFees(catalog, period) {
  return catalog.filter((fee) => fee.type === 'required' && (!fee.start || fee.start <= period) && (!fee.end || period <= fee.end));
}

export function buildSheet(period, catalog, households) {
  if (!validPeriod(period)) throw new Error('Vui lòng chọn kỳ thu hợp lệ.');
  const fees = applicableFees(catalog, period);
  if (!fees.length) throw new Error('Kỳ này chưa có phí bắt buộc. Hãy thêm khoản thu vào danh mục.');
  if (!households.length) throw new Error('Hãy thêm hộ gia đình trước khi lập bảng phí.');
  const rows = households.map(({ id, apartmentNumber, headName, area }) => ({
    householdId: id, apartmentNumber, headName, area,
    lines: fees.map((fee) => {
      const amount = Math.round(area * fee.rate);
      if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Số tiền vượt phạm vi tính phí.');
      return { feeId: fee.id, amount, receipt: null };
    }),
  }));
  return { period, fees: fees.map(({ id, name, rate }) => ({ id, name, rate })), rows };
}

function sampleDatabase(homes) {
  const sheets = {};
  if (homes.length) {
    const sample = buildSheet('2026-09', sampleFees, homes);
    sample.rows[0].lines[0].receipt = { date: '2026-09-15T02:00:00Z', username: 'demo', collector: 'Thủ quỹ demo', method: 'Tiền mặt' };
    sheets[sample.period] = sample;
  }
  return { catalog: sampleFees.map((fee) => ({ ...fee })), sheets };
}

// Đọc, kiểm tra trùng và ghi cùng một transaction, kể cả khi nhiều tab đang mở.
async function access(fn, write = false) {
  const homes = await householdApi.list();
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(key, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('fees');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const connection = open.result;
      const tx = connection.transaction('fees', 'readwrite');
      const store = tx.objectStore('fees');
      const request = store.get('data');
      let result;
      let failure;
      request.onsuccess = () => {
        try {
          const db = request.result ?? sampleDatabase(homes);
          result = fn(db, homes);
          if (write || !request.result) store.put(db, 'data');
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
      tx.onabort = () => { connection.close(); reject(failure ?? tx.error); };
      tx.oncomplete = () => { connection.close(); resolve(result); };
    };
  });
}

export const feeApi = {
  list: () => access((db) => db),
  saveFee: (values) => access((db) => {
    const errors = validateFee(values, db.catalog);
    if (Object.keys(errors).length) throw Object.assign(new Error('Kiểm tra lại thông tin khoản thu.'), { fields: errors });
    const fee = { ...values, id: values.id || 'KT' + String(db.catalog.length + 1).padStart(3, '0'),
      name: values.name.trim(), rate: values.type === 'required' ? Number(values.rate) : null };
    if (values.id) db.catalog = db.catalog.map((item) => item.id === fee.id ? fee : item);
    else db.catalog.push(fee);
    return db;
  }, true),
  preview: (period) => access((db, homes) => db.sheets[period] ?? buildSheet(period, db.catalog, homes)),
  generate: (period) => access((db, homes) => {
    if (db.sheets[period]) throw new Error('Bảng phí của kỳ này đã được lập.');
    db.sheets[period] = buildSheet(period, db.catalog, homes);
    return db;
  }, true),
  collect: (period, householdId, feeId) => access((db) => {
    const user = authApi.session();
    if (!user) throw new Error('Vui lòng đăng nhập lại.');
    const row = db.sheets[period]?.rows.find((item) => item.householdId === householdId);
    const line = row?.lines.find((item) => item.feeId === feeId);
    if (!line) throw new Error('Không tìm thấy khoản phí.');
    if (line.receipt) throw new Error('Khoản phí này đã được thu.');
    line.receipt = { date: new Date().toISOString(), username: user.username, collector: user.name, method: 'Tiền mặt' };
    return db;
  }, true),
};
