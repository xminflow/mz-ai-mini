import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { HotBoardList } from "../realtime-trends/HotBoardList";
import {
  boardLabels,
  boardOrder,
  realtimeTrendsStrings as strings,
} from "../realtime-trends/strings";

export function RealTimeTrendsPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-6" data-testid="realtime-trends-page">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">{strings.pageHeading}</h2>
      </header>

      <Tabs defaultValue={boardOrder[0]}>
        <TabsList>
          {boardOrder.map((board) => (
            <TabsTrigger
              key={board}
              value={board}
              data-testid={`realtime-trends-tab-${board}`}
            >
              {boardLabels[board]}
            </TabsTrigger>
          ))}
        </TabsList>
        {boardOrder.map((board) => (
          <TabsContent key={board} value={board}>
            <HotBoardList board={board} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
