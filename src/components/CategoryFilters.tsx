import { CATEGORIES, CategoryConfig } from "@/lib/constants";

interface CategoryFiltersProps {
  activeCategories: Set<string>;
  onToggle: (categoryId: string) => void;
}

export default function CategoryFilters({
  activeCategories,
  onToggle,
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((cat) => (
        <CategoryPill
          key={cat.id}
          category={cat}
          active={activeCategories.has(cat.id)}
          onToggle={() => onToggle(cat.id)}
        />
      ))}
    </div>
  );
}

function CategoryPill({
  category,
  active,
  onToggle,
}: {
  category: CategoryConfig;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 border"
      style={{
        background: active ? `${category.color}20` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${category.color}50` : "rgba(255,255,255,0.06)",
        color: active ? category.color : "rgba(255,255,255,0.3)",
      }}
    >
      {category.label}
    </button>
  );
}
