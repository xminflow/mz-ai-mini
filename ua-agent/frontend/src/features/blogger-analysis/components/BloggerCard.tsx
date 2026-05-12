import { useNavigate } from "react-router-dom";

import type { Blogger } from "@/shared/contracts/blogger";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

import { bloggerStrings } from "../strings";

import { BloggerProfileBlock } from "./BloggerProfileBlock";

interface Props {
  blogger: Blogger;
}

function detailRoute(bloggerId: string): string {
  return `/blogger-analysis/douyin/${bloggerId}`;
}

export function BloggerCard({ blogger }: Props): JSX.Element {
  const navigate = useNavigate();
  const status = blogger.status;

  const openDetail = (): void => {
    navigate(detailRoute(blogger.id));
  };

  return (
    <Card
      data-testid="blogger-card"
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`进入${blogger.display_name ?? "博主"}详情`}
    >
      <CardContent className="flex h-full flex-col gap-3 pt-6">
        {status === "pending" ? (
          <div className="flex-1">
            <p className="break-all text-sm text-muted-foreground" title={blogger.profile_url}>
              {blogger.profile_url}
            </p>
          </div>
        ) : (
          <div className="flex-1">
            <BloggerProfileBlock blogger={blogger} />
          </div>
        )}

        {status !== "profile_ready" ? (
          <div className="flex flex-wrap gap-1">
            {status === "pending" ? (
              <Badge variant="outline">{bloggerStrings.pendingBadge}</Badge>
            ) : null}
            {status === "sampled" ? (
              <>
                <Badge variant="secondary">已采样</Badge>
                {blogger.analysis_generated_at !== null &&
                (blogger.analysis_error === null || blogger.analysis_error.length === 0) ? (
                  <Badge variant="secondary">{bloggerStrings.reportReadyBadge}</Badge>
                ) : null}
              </>
            ) : null}
            {status === "error" ? (
              <Badge variant="destructive">{bloggerStrings.errorBadge}</Badge>
            ) : null}
          </div>
        ) : null}

        {blogger.last_error !== null && status === "error" ? (
          <p className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
            {blogger.last_error}
          </p>
        ) : null}

      </CardContent>
    </Card>
  );
}
