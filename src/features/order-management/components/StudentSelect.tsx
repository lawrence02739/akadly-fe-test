import { STATIC_STUDENTS } from '../static-data';

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
  className?: string;
}

export default function StudentSelect({ value, onChange, className = '' }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const name = STATIC_STUDENTS.find((s) => s.id === id)?.name ?? '';
        onChange(id, name);
      }}
      className={`px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${className}`}
      required
    >
      <option value="">Select a student...</option>
      {STATIC_STUDENTS.map((student) => (
        <option key={student.id} value={student.id}>
          {student.name} ({student.id})
        </option>
      ))}
    </select>
  );
}
