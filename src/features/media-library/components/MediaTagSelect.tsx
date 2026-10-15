import CreatableDropdown from '../../../shared/components/CreatableDropdown';
import { useTags, useCreateTag } from '../../courses/hooks/useMasterData';
import type { MasterData } from '../../courses/api/master-data.api';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function MediaTagSelect({
  value,
  onChange,
  label,
  placeholder = 'Select or type tags...',
}: Props) {
  const { data: rawTags = [] } = useTags();
  const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();

  const tags = (rawTags as MasterData[]) || [];
  const items = tags.map((t) => ({
    _id: t._id,
    name: t.name,
  }));

  const handleCreate = async (
    name: string,
  ): Promise<{ _id: string; name: string }> => {
    const created = (await createTag(name)) as MasterData;
    return { _id: created._id, name: created.name };
  };

  return (
    <CreatableDropdown
      label={label}
      items={items}
      value={value || []}
      onChange={(val) => {
        const next = Array.isArray(val) ? val : val ? [String(val)] : [];
        onChange(next);
      }}
      onCreate={handleCreate}
      isCreating={isCreating}
      multiple={true}
      placeholder={placeholder}
    />
  );
}
