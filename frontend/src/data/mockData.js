export const households = [
  { id: 'h1', apartmentNumber: 'A-101', area: 72.5, headName: 'Nguyễn Văn Minh' },
  { id: 'h2', apartmentNumber: 'A-203', area: 85, headName: 'Trần Thị Lan' },
  { id: 'h3', apartmentNumber: 'A-305', area: 64.2, headName: 'Lê Hoàng Nam' },
  { id: 'h4', apartmentNumber: 'B-102', area: 90, headName: 'Phạm Thu Hương' },
  { id: 'h5', apartmentNumber: 'B-406', area: 78, headName: 'Vũ Đức Anh' },
  { id: 'h6', apartmentNumber: 'C-502', area: 105.5, headName: 'Đỗ Minh Hà' },
];

export const relationships = ['Chủ hộ', 'Vợ/chồng', 'Con', 'Cha/mẹ', 'Khác'];

export const residents = [
  { id: 'r1', fullName: 'Nguyễn Văn Minh', birthDate: '1985-05-17', nationalId: '099000000001', relationship: 'Chủ hộ', householdId: 'h1' },
  { id: 'r2', fullName: 'Nguyễn Minh An', birthDate: '2020-08-22', nationalId: '', relationship: 'Con', householdId: 'h1' },
  { id: 'r3', fullName: 'Trần Thị Lan', birthDate: '1990-03-09', nationalId: '099000000003', relationship: 'Chủ hộ', householdId: 'h2' },
  { id: 'r4', fullName: 'Lê Hoàng Nam', birthDate: '1988-11-02', nationalId: '099000000004', relationship: 'Chủ hộ', householdId: 'h3' },
  { id: 'r5', fullName: 'Phạm Thu Hương', birthDate: '1992-07-12', nationalId: '099000000005', relationship: 'Chủ hộ', householdId: 'h4' },
  { id: 'r6', fullName: 'Vũ Đức Anh', birthDate: '1984-02-28', nationalId: '099000000006', relationship: 'Chủ hộ', householdId: 'h5' },
  { id: 'r7', fullName: 'Đỗ Minh Hà', birthDate: '1995-12-03', nationalId: '099000000007', relationship: 'Chủ hộ', householdId: 'h6' },
  { id: 'r8', fullName: 'Đỗ An Nhiên', birthDate: '2021-06-10', nationalId: '', relationship: 'Con', householdId: 'h6' },
];
