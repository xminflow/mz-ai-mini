import { useQuery } from "@tanstack/react-query";

import {
  bloggerListSamplesResultSchema,
  type BloggerVideoSample,
} from "@/shared/contracts/blogger";

export function useBloggerSamples(
  id: string | null,
  enabled: boolean,
): {
  samples: BloggerVideoSample[];
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: ["blogger-samples", id],
    enabled: enabled && id !== null,
    queryFn: async () => {
      if (id === null) return [];
      if (window.api?.blogger?.listSamples === undefined) return [];
      const raw = await window.api.blogger.listSamples({ id });
      const parsed = bloggerListSamplesResultSchema.safeParse(raw);
      if (!parsed.success || !parsed.data.ok) return [];
      return parsed.data.samples;
    },
  });
  return {
    samples: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
