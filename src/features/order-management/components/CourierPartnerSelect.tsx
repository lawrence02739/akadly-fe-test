import { STATIC_COURIER_PARTNERS } from '../static-data';

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
  className?: string;
}

export default function CourierPartnerSelect({ value, onChange, className = '' }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const name = STATIC_COURIER_PARTNERS.find((c) => c.id === id)?.name ?? '';
        onChange(id, name);
      }}
      className={`px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${className}`}
      required
    >
      <option value="">Select a courier partner...</option>
      {STATIC_COURIER_PARTNERS.map((courier) => (
        <option key={courier.id} value={courier.id}>
          {courier.name}
        </option>
      ))}
    </select>
  );
}
