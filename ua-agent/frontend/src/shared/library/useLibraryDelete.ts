import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  LibraryListResult,
  LibraryListSuccess,
} from "@/shared/contracts/library";

import { libraryStrings as strings } from "./strings";

interface MutationVariables {
  postId: string;
}

interface OptimisticContext {
  snapshots: { queryKey: unknown[]; data: LibraryListResult | undefined }[];
}

export function useLibraryDelete() {
  const queryClient = useQueryClient();

  return useMutation<{ deletedPostId: string }, Error, MutationVariables, OptimisticContext>({
    mutationFn: async ({ postId }) => {
      const result = await window.api.libraryDelete(postId);
      if (!result.ok) {
        throw new Error(result.error.message || strings.deleteFailed);
      }
      return { deletedPostId: result.deleted_post_id };
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["library", "list"] });
      const raw = queryClient.getQueriesData<LibraryListResult>({
        queryKey: ["library", "list"],
      });
      const snapshots = raw.map(([queryKey, data]) => ({
        queryKey: queryKey as unknown[],
        data,
      }));
      for (const { queryKey, data } of snapshots) {
        if (!data || !data.ok) continue;
        const updated: LibraryListSuccess = {
          ...data,
          entries: data.entries.filter((e) => e.post_id !== postId),
          total: Math.max(0, data.total - 1),
          library_total: Math.max(0, data.library_total - 1),
        };
        queryClient.setQueryData(queryKey, updated);
      }
      return { snapshots };
    },
    onError: (err, _vars, context) => {
      if (context) {
        for (const { queryKey, data } of context.snapshots) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(strings.deleteFailed, { description: err.message });
    },
    onSuccess: () => {
      toast.success(strings.deleted);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "list"] });
    },
  });
}
