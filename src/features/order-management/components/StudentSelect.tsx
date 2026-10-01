import { useListStudentOptions } from '../../students/hooks/useStudents';

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
  className?: string;
}

export default function StudentSelect({ value, onChange, className = '' }: Props) {
  const { data: students = [], isLoading } = useListStudentOptions();

  return (
    <select
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const name = students.find((s: any) => s.id === id)?.fullName ?? '';
        onChange(id, name);
      }}
      className={`px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:opacity-50 ${className}`}
      required
      disabled={isLoading}
    >
      <option value="">{isLoading ? 'Loading students...' : 'Select a student...'}</option>
      {students.map((student: any) => (
        <option key={student.id} value={student.id}>
          {student.fullName} ({student.studentCode || student.id})
        </option>
      ))}
    </select>
  );
}
