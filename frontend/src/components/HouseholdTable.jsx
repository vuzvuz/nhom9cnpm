import { Building2 } from 'lucide-react';
import { DataTable } from './Management.jsx';
import { formatNumber } from '../utils/format.js';

export default function HouseholdTable({ households }) {
  return (
    <DataTable label="Danh sách hộ gia đình" columns={['Căn hộ', 'Chủ hộ', 'Diện tích']}>
      {households.map((household) => (
        <tr key={household.id}>
          <th scope="row">
            <div className="cell-leading">
              <span className="table-icon"><Building2 size={17} /></span>
              {household.apartmentNumber}
            </div>
          </th>
          <td>{household.headName}</td>
          <td>{formatNumber(household.area)} m²</td>
        </tr>
      ))}
    </DataTable>
  );
}
