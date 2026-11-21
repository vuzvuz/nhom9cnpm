import { households, residents } from '../data/mockData.js';
import { validateHousehold, validateLogin, validatePasswordChange, validateResident } from './validation.js';

const databaseKey = 'bluemoon-sprint1-data-v1';
const sessionKey = 'bluemoon-sprint1-session';
const delay = () => new Promise((resolve) => setTimeout(resolve, 220));
const demoUser = { username: 'admin', name: 'Quản trị viên' };

export const demoCredentials = { username: demoUser.username, password: 'BlueMoon123!' };
let demoPassword = demoCredentials.password;

class ValidationError extends Error {
  constructor(fields) {
    super('Vui lòng kiểm tra các trường được đánh dấu.');
    this.fields = fields;
  }
}

function requireValid(errors) {
  if (Object.keys(errors).length) throw new ValidationError(errors);
}

function readDatabase() {
  const saved = localStorage.getItem(databaseKey);
  if (!saved) return { households, residents };

  const data = JSON.parse(saved);
  if (!Array.isArray(data?.households) || !Array.isArray(data?.residents)) {
    throw new Error('Dữ liệu demo không hợp lệ.');
  }
  return data;
}

function saveDatabase(data) {
  localStorage.setItem(databaseKey, JSON.stringify(data));
}

export const householdApi = {
  async list() {
    await delay();
    return readDatabase().households;
  },
  async create(values) {
    await delay();
    const data = readDatabase();
    requireValid(validateHousehold(values, data.households));

    const household = {
      id: crypto.randomUUID(),
      apartmentNumber: values.apartmentNumber.trim().toUpperCase(),
      area: Number(values.area),
      headName: values.headName.trim(),
    };
    saveDatabase({ ...data, households: [household, ...data.households] });
    return household;
  },
};

export const residentApi = {
  async list() {
    await delay();
    return readDatabase().residents;
  },
  async save(values, id) {
    await delay();
    const data = readDatabase();
    requireValid(validateResident(values, data.households));

    if (id && !data.residents.some((resident) => resident.id === id)) {
      throw new Error('Nhân khẩu này không còn tồn tại.');
    }

    const resident = {
      id: id ?? crypto.randomUUID(),
      fullName: values.fullName.trim(),
      birthDate: values.birthDate,
      nationalId: values.nationalId.trim(),
      relationship: values.relationship,
      householdId: values.householdId,
    };
    const nextResidents = id
      ? data.residents.map((item) => (item.id === id ? resident : item))
      : [resident, ...data.residents];

    saveDatabase({ ...data, residents: nextResidents });
    return resident;
  },
};

export const authApi = {
  session() {
    try {
      return sessionStorage.getItem(sessionKey) === demoUser.username ? demoUser : null;
    } catch {
      return null;
    }
  },
  async login(values) {
    await delay();
    requireValid(validateLogin(values));
    if (values.username.trim() !== demoUser.username || values.password !== demoPassword) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    sessionStorage.setItem(sessionKey, demoUser.username);
    return demoUser;
  },
  logout() {
    sessionStorage.removeItem(sessionKey);
  },
  async changePassword(values) {
    await delay();
    if (!authApi.session()) throw new Error('Vui lòng đăng nhập lại.');
    requireValid(validatePasswordChange(values));
    if (values.currentPassword !== demoPassword) {
      throw new ValidationError({ currentPassword: 'Mật khẩu hiện tại không đúng.' });
    }
    demoPassword = values.newPassword;
  },
};
