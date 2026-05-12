import { BloggerAddCard } from "./components/BloggerAddCard";
import { BloggerCard } from "./components/BloggerCard";
import { useBloggersList } from "./hooks/useBloggers";
import { bloggerStrings } from "./strings";

export function BloggerAnalysisShell(): JSX.Element {
  const { bloggers, isLoading } = useBloggersList();

  return (
    <div
      className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-6"
      data-testid="blogger-analysis-screen"
    >
      <header>
        <h1 className="text-2xl font-semibold">{bloggerStrings.pageHeading}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{bloggerStrings.pageSubheading}</p>
      </header>

      <div
        className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]"
        data-testid="blogger-list"
      >
        <BloggerAddCard />
        {bloggers.map((b) => (
          <BloggerCard key={b.id} blogger={b} />
        ))}
      </div>

      {isLoading && bloggers.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">加载中…</p>
      ) : null}
    </div>
  );
}
