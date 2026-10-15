import CreatableDropdown from '../../../shared/components/CreatableDropdown';
import {
  useCategories,
  useCreateCategory,
} from '../../courses/hooks/useMasterData';
import type { MasterData } from '../../courses/api/master-data.api';

interface Props {
  value: string;
  onChange: (categoryId: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MediaCategorySelect({
  value,
  onChange,
  label,
  placeholder = 'Select or create category...',
}: Props) {
  const { data: rawCategories = [] } = useCategories();
  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateCategory();

  const categories = (rawCategories as MasterData[]) || [];
  const items = categories.map((c) => ({
    _id: c._id,
    name: c.name,
  }));

  const handleCreate = async (name: string): Promise<{ _id: string; name: string }> => {
    const created = (await createCategory(name)) as MasterData;
    onChange(created._id);
    return { _id: created._id, name: created.name };
  };

  // Find selected category name for display in CreatableDropdown
  const selectedCategory = categories.find(
    (c) => c._id === value || c.name === value,
  );
  const displayValue = selectedCategory ? selectedCategory.name : value;

  return (
    <CreatableDropdown
      label={label}
      items={items}
      value={displayValue}
      onChange={(val) => {
        const strVal = String(val || '');
        const matched = categories.find(
          (c) =>
            c.name.toLowerCase() === strVal.toLowerCase() || c._id === strVal,
        );
        onChange(matched ? matched._id : strVal);
      }}
      onCreate={handleCreate}
      isCreating={isCreating}
      placeholder={placeholder}
    />
  );
}
