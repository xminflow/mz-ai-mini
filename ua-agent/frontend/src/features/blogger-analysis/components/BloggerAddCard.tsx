import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { useBloggerCaptureProfile, useBloggerCreate } from "../hooks/useBloggers";
import { bloggerStrings } from "../strings";

export function BloggerAddCard(): JSX.Element {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useBloggerCreate();
  const capture = useBloggerCaptureProfile();

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = url.trim();
    if (trimmed.length === 0) {
      setError(bloggerStrings.invalidUrl);
      return;
    }
    setError(null);
    try {
      const result = await create.mutateAsync({ profile_url: trimmed });
      if (result.ok) {
        setUrl("");
        // Auto-trigger profile capture for brand-new (pending) bloggers, so
        // the user doesn't have to click 「采集资料」 manually. If the URL was
        // already in the library and is past the pending stage, leave it
        // alone — re-capturing would clobber existing data.
        if (result.blogger.status === "pending") {
          capture.mutate({ id: result.blogger.id });
        }
      } else {
        setError(result.error.message);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[BloggerAddCard] mutateAsync rejected:", e);
      setError(`保存失败：${message}`);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex h-full flex-col gap-3 pt-6">
        <header className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{bloggerStrings.addButtonLabel}</h3>
        </header>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-2">
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error !== null) setError(null);
            }}
            placeholder={bloggerStrings.addUrlPlaceholder}
            data-testid="blogger-add-input"
            aria-invalid={error !== null}
            disabled={create.isPending}
          />
          {error !== null ? (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="mt-auto w-full"
            disabled={create.isPending || url.trim().length === 0}
            data-testid="blogger-add-submit"
          >
            {create.isPending ? bloggerStrings.addingButtonLabel : bloggerStrings.addButtonLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
