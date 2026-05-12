import type { LibraryListQuery } from "@/shared/types/api";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { libraryStrings as strings } from "./strings";

interface LibraryFiltersProps {
  filters: LibraryListQuery;
  onChange: (next: LibraryListQuery) => void;
}

export function LibraryFilters({ filters, onChange }: LibraryFiltersProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="text"
        placeholder={strings.filterAuthorPlaceholder}
        value={filters.author ?? ""}
        onChange={(e) => onChange({ ...filters, author: e.target.value || null })}
        className="w-56"
      />
      <Input
        type="datetime-local"
        placeholder={strings.filterFromPlaceholder}
        aria-label={strings.filterFromPlaceholder}
        value={filters.from ?? ""}
        onChange={(e) => onChange({ ...filters, from: e.target.value || null })}
        className="w-56"
      />
      <Input
        type="datetime-local"
        placeholder={strings.filterToPlaceholder}
        aria-label={strings.filterToPlaceholder}
        value={filters.to ?? ""}
        onChange={(e) => onChange({ ...filters, to: e.target.value || null })}
        className="w-56"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onChange({
            from: null,
            to: null,
            author: null,
            limit: filters.limit ?? 50,
            offset: 0,
          })
        }
      >
        {strings.clearFilters}
      </Button>
    </div>
  );
}
