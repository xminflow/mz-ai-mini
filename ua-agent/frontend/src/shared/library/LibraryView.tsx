import { useState } from "react";

import type { LibraryListQuery } from "@/shared/types/api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

import { LibraryFilters } from "./LibraryFilters";
import { LibraryList } from "./LibraryList";
import { libraryStrings as strings } from "./strings";
import { useLibraryDelete } from "./useLibraryDelete";

const INITIAL_FILTERS: LibraryListQuery = {
  from: null,
  to: null,
  author: null,
  limit: 50,
  offset: 0,
};

interface LibraryViewProps {
  /** Top-level title rendered above the filters. Defaults to "素材库". */
  title?: string;
  /** Optional zh-CN subtitle. */
  description?: string;
}

export function LibraryView({
  title = "素材库",
  description = "浏览、筛选、删除已收集的素材。",
}: LibraryViewProps = {}): JSX.Element {
  const [filters, setFilters] = useState<LibraryListQuery>(INITIAL_FILTERS);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const deleteMutation = useLibraryDelete();

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <LibraryFilters filters={filters} onChange={setFilters} />

      <LibraryList
        filters={filters}
        onClearFilters={() => setFilters(INITIAL_FILTERS)}
        onDelete={(postId) => setPendingDelete(postId)}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{strings.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{strings.confirmDeleteBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{strings.confirmDeleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  deleteMutation.mutate({ postId: pendingDelete });
                }
                setPendingDelete(null);
              }}
            >
              {strings.confirmDeleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
