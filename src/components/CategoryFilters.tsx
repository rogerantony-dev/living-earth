import { CATEGORIES, CategoryConfig } from "@/lib/constants";

interface CategoryFiltersProps {
  activeCategories: Set<string>;
  categoryCounts: Record<string, number>;
  onToggle: (categoryId: string) => void;
}

export default function CategoryFilters({
  activeCategories,
  categoryCounts,
  onToggle,
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((cat) => (
        <CategoryPill
          key={cat.id}
          category={cat}
          count={categoryCounts[cat.id] ?? 0}
          active={activeCategories.has(cat.id)}
          onToggle={() => onToggle(cat.id)}
        />
      ))}
    </div>
  );
}

function CategoryPill({
  category,
  count,
  active,
  onToggle,
}: {
  category: CategoryConfig;
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 border cursor-pointer"
      style={{
        background: active ? `${category.color}20` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${category.color}50` : "rgba(255,255,255,0.06)",
        color: active ? category.color : "rgba(255,255,255,0.3)",
      }}
    >
      {count > 0 && (
        <span
          className="absolute -top-2.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-semibold leading-none px-1"
          style={{
            background: active ? category.color : "rgba(255,255,255,0.15)",
            color: active ? "#0a0a0f" : "rgba(255,255,255,0.5)",
          }}
        >
          {count}
        </span>
      )}
      {category.label}
    </button>
  );
}
