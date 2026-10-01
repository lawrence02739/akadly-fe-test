import { useListCourierPartnerOptions } from '../../courier-partners/hooks/useCourierPartners';

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
  className?: string;
}

export default function CourierPartnerSelect({ value, onChange, className = '' }: Props) {
  const { data: partners = [], isLoading } = useListCourierPartnerOptions();

  return (
    <select
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const name = partners.find((c: any) => c.id === id)?.name ?? '';
        onChange(id, name);
      }}
      className={`px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:opacity-50 ${className}`}
      required
      disabled={isLoading}
    >
      <option value="">{isLoading ? 'Loading partners...' : 'Select a courier partner...'}</option>
      {partners.map((courier: any) => (
        <option key={courier.id} value={courier.id}>
          {courier.name}
        </option>
      ))}
    </select>
  );
}
