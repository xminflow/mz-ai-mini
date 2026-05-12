import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";

import type { Platform } from "@/shared/contracts/capture";
import type {
  KeywordComparisonOp,
  KeywordMetricFilterMode,
  KeywordPublishTimeRange,
  KeywordRow as KeywordRowData,
} from "@/shared/contracts/keyword/keyword-list";

import { keywordsStrings } from "./strings";
import { useKeywordCreate } from "./useKeywordCreate";
import { useKeywordUpdate } from "./useKeywordUpdate";

interface KeywordEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog operates in "edit" mode against this row. */
  editingKeyword?: KeywordRowData;
  /** 006 — platform Tab the new keyword belongs to. Defaults to "douyin"
   *  while the Tab UI is wired in PR 3. */
  platform?: Platform;
}

const MAX = 100;
const DEFAULT_TARGET = 10;
const DEFAULT_HEALTH = 500;
const DEFAULT_RATIO = 1;

const FILTER_MODE_OPTIONS: Array<{ value: KeywordMetricFilterMode; label: string }> = [
  { value: "none", label: keywordsStrings.filterModeNone },
  { value: "ratio", label: keywordsStrings.filterModeRatio },
  { value: "author_metrics", label: keywordsStrings.filterModeAuthorMetrics },
];

const TIME_RANGE_OPTIONS: Array<{ value: KeywordPublishTimeRange; label: string }> = [
  { value: "all", label: keywordsStrings.publishTimeAll },
  { value: "day", label: keywordsStrings.publishTimeDay },
  { value: "week", label: keywordsStrings.publishTimeWeek },
  { value: "half_year", label: keywordsStrings.publishTimeHalfYear },
];

const COMP_OPTIONS: Array<{ value: KeywordComparisonOp; label: string }> = [
  { value: "gte", label: keywordsStrings.comparisonGte },
  { value: "lte", label: keywordsStrings.comparisonLte },
];

function clampInt(raw: string, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function clampRatio(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n * 10) / 10;
}

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

function sectionBadgeLabel(
  filterMode: KeywordMetricFilterMode,
  ratioInput: string,
  publishTimeRange: KeywordPublishTimeRange,
): string {
  const timeLabel = TIME_RANGE_OPTIONS.find((opt) => opt.value === publishTimeRange)?.label ?? "";
  if (filterMode === "ratio") return `当前：粉赞比 · ${timeLabel} · 比值 ${ratioInput || "0.0"}`;
  if (filterMode === "author_metrics") return `当前：作者指标 · ${timeLabel}`;
  return `当前：不筛选 · ${timeLabel}`;
}

interface KeywordChoiceFieldProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onValueChange: (value: T) => void;
  placeholder: string;
  testId: string;
  disabled?: boolean;
  helperText?: string;
}

function KeywordChoiceField<T extends string>({
  id,
  label,
  value,
  options,
  onValueChange,
  placeholder,
  testId,
  disabled = false,
  helperText,
}: KeywordChoiceFieldProps<T>): JSX.Element {
  const currentLabel = options.find((opt) => opt.value === value)?.label ?? placeholder;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={id}>
          {label}
        </label>
        {helperText !== undefined ? (
          <span className="text-[11px] text-muted-foreground">{helperText}</span>
        ) : null}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="h-10 w-full justify-between bg-background font-normal"
            disabled={disabled}
            data-testid={`${testId}-trigger`}
          >
            <span className={cn("truncate", currentLabel === placeholder && "text-muted-foreground")}>
              {currentLabel}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onValueChange(next as T)}
          >
            {options.map((opt) => (
              <DropdownMenuRadioItem
                key={opt.value}
                value={opt.value}
                data-testid={`${testId}-item-${opt.value === "" ? "empty" : opt.value}`}
              >
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function KeywordEditDialog({
  open,
  onOpenChange,
  editingKeyword,
  platform = "douyin",
}: KeywordEditDialogProps): JSX.Element {
  const [text, setText] = useState("");
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [healthInput, setHealthInput] = useState(String(DEFAULT_HEALTH));
  const [ratioInput, setRatioInput] = useState(DEFAULT_RATIO.toFixed(1));
  const [filterMode, setFilterMode] = useState<KeywordMetricFilterMode>("ratio");
  const [publishTimeRange, setPublishTimeRange] = useState<KeywordPublishTimeRange>("all");
  const [followerOp, setFollowerOp] = useState<KeywordComparisonOp | "">("");
  const [followerValue, setFollowerValue] = useState("");
  const [likeOp, setLikeOp] = useState<KeywordComparisonOp | "">("");
  const [likeValue, setLikeValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const createMutation = useKeywordCreate();
  const updateMutation = useKeywordUpdate();
  const isEdit = editingKeyword !== undefined;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setText(editingKeyword?.text ?? "");
    setTargetInput(String(editingKeyword?.target_cap ?? DEFAULT_TARGET));
    setHealthInput(String(editingKeyword?.health_cap ?? DEFAULT_HEALTH));
    setFilterMode(editingKeyword?.metric_filter_mode ?? "ratio");
    setRatioInput(
      editingKeyword !== undefined
        ? editingKeyword.min_like_follower_ratio.toFixed(1)
        : DEFAULT_RATIO.toFixed(1),
    );
    setPublishTimeRange(editingKeyword?.publish_time_range ?? "all");
    setFollowerOp(editingKeyword?.author_follower_count_op ?? "");
    setFollowerValue(
      editingKeyword?.author_follower_count_value !== null &&
        editingKeyword?.author_follower_count_value !== undefined
        ? String(editingKeyword.author_follower_count_value)
        : "",
    );
    setLikeOp(editingKeyword?.like_count_op ?? "");
    setLikeValue(
      editingKeyword?.like_count_value !== null && editingKeyword?.like_count_value !== undefined
        ? String(editingKeyword.like_count_value)
        : "",
    );
    setValidationError(null);
  }, [open, editingKeyword]);

  function clientValidate(raw: string): string | null {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return keywordsStrings.validationEmpty;
    if (trimmed.length > MAX) return keywordsStrings.validationTooLong;
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const err = clientValidate(text);
    if (err !== null) {
      setValidationError(err);
      return;
    }
    const target = clampInt(targetInput, DEFAULT_TARGET);
    const health = clampInt(healthInput, DEFAULT_HEALTH);
    const ratio = clampRatio(ratioInput);
    const followerParsed = parsePositiveInt(followerValue);
    const likeParsed = parsePositiveInt(likeValue);
    const followerEnabled = followerOp !== "" || followerParsed !== null;
    const likeEnabled = likeOp !== "" || likeParsed !== null;

    if (filterMode === "ratio" && ratio <= 0) {
      setValidationError(keywordsStrings.validationRatioPositive);
      return;
    }
    if (filterMode === "author_metrics" && !followerEnabled && !likeEnabled) {
      setValidationError(keywordsStrings.validationAuthorMetricsRequired);
      return;
    }
    if (
      filterMode === "author_metrics" &&
      ((followerOp !== "" && followerParsed === null) ||
        (followerOp === "" && followerParsed !== null) ||
        (likeOp !== "" && likeParsed === null) ||
        (likeOp === "" && likeParsed !== null))
    ) {
      setValidationError(keywordsStrings.validationThresholdPair);
      return;
    }

    setValidationError(null);
    const payload = {
      text,
      target_cap: target,
      health_cap: health,
      metric_filter_mode: filterMode,
      min_like_follower_ratio: filterMode === "ratio" ? ratio : 0,
      publish_time_range: publishTimeRange,
      author_follower_count_op:
        filterMode === "author_metrics" && followerEnabled ? (followerOp || null) : null,
      author_follower_count_value:
        filterMode === "author_metrics" && followerEnabled ? followerParsed : null,
      like_count_op: filterMode === "author_metrics" && likeEnabled ? (likeOp || null) : null,
      like_count_value: filterMode === "author_metrics" && likeEnabled ? likeParsed : null,
    };

    try {
      if (isEdit && editingKeyword !== undefined) {
        const result = await updateMutation.mutateAsync({
          id: editingKeyword.id,
          ...payload,
        });
        if (result.ok) {
          onOpenChange(false);
        } else {
          setValidationError(result.error.message);
        }
      } else {
        const result = await createMutation.mutateAsync({
          platform,
          ...payload,
        });
        if (result.ok) {
          onOpenChange(false);
        } else {
          setValidationError(result.error.message);
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // eslint-disable-next-line no-console
      console.error("[KeywordEditDialog] mutation threw:", e);
      toast.error(`保存失败：${message}`);
      setValidationError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <form onSubmit={onSubmit} aria-label="keyword-edit-form" className="flex max-h-[88vh] flex-col">
          <DialogHeader className="border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-xl">
              {isEdit ? keywordsStrings.editDialogTitle : keywordsStrings.addDialogTitle}
            </DialogTitle>
            <DialogDescription>{keywordsStrings.placeholderText || keywordsStrings.fieldsHelp}</DialogDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{isEdit ? "编辑模式" : "新建关键词"}</Badge>
              <Badge variant="outline">
                {TIME_RANGE_OPTIONS.find((opt) => opt.value === publishTimeRange)?.label}
              </Badge>
              <Badge variant={filterMode === "none" ? "secondary" : "default"}>
                {FILTER_MODE_OPTIONS.find((opt) => opt.value === filterMode)?.label}
              </Badge>
              <Badge variant="outline">
                {sectionBadgeLabel(filterMode, ratioInput, publishTimeRange)}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid gap-4 overflow-y-auto px-6 py-5">
            {validationError !== null ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
                data-testid="keyword-edit-error"
              >
                {validationError}
              </div>
            ) : null}

            <Card className="border-slate-200/80 shadow-none">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm">基础信息</CardTitle>
                <CardDescription>关键词、目标采集数、浏览上限和发布时间。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 pt-0">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="kw-edit-text">
                    {keywordsStrings.fieldText}
                  </label>
                  <Input
                    id="kw-edit-text"
                    autoFocus
                    maxLength={MAX + 10}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder={keywordsStrings.placeholderText || "输入关键词"}
                    aria-invalid={validationError !== null}
                    data-testid="keyword-edit-input"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="kw-edit-target">
                      {keywordsStrings.fieldTargetCap}
                    </label>
                    <Input
                      id="kw-edit-target"
                      type="number"
                      min={1}
                      max={10000}
                      step={1}
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      data-testid="keyword-edit-target"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="kw-edit-health">
                      {keywordsStrings.fieldHealthCap}
                    </label>
                    <Input
                      id="kw-edit-health"
                      type="number"
                      min={1}
                      max={50000}
                      step={1}
                      value={healthInput}
                      onChange={(e) => setHealthInput(e.target.value)}
                      data-testid="keyword-edit-health"
                    />
                  </div>
                  <KeywordChoiceField
                    id="kw-edit-time"
                    label={keywordsStrings.fieldPublishTimeRange}
                    value={publishTimeRange}
                    options={TIME_RANGE_OPTIONS}
                    onValueChange={setPublishTimeRange}
                    placeholder="请选择发布时间"
                    testId="keyword-edit-time"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-none">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm">筛选规则</CardTitle>
                <CardDescription>在粉赞比和作者阈值之间切换，保持规则一眼可读。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 pt-0">
                <div className="grid gap-3 md:grid-cols-2">
                  <KeywordChoiceField
                    id="kw-edit-mode"
                    label={keywordsStrings.fieldFilterMode}
                    value={filterMode}
                    options={FILTER_MODE_OPTIONS}
                    onValueChange={setFilterMode}
                    placeholder="请选择筛选模式"
                    testId="keyword-edit-mode"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="kw-edit-ratio">
                      {keywordsStrings.fieldRatio}
                    </label>
                    <Input
                      id="kw-edit-ratio"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={ratioInput}
                      onChange={(e) => setRatioInput(e.target.value)}
                      disabled={filterMode !== "ratio"}
                      data-testid="keyword-edit-ratio"
                    />
                  </div>
                </div>

                {filterMode === "author_metrics" ? (
                  <>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <label
                            className="text-xs font-medium text-muted-foreground"
                            htmlFor="kw-edit-follower-op"
                          >
                            {keywordsStrings.fieldFollowerThreshold}
                          </label>
                          <Badge variant="secondary">粉丝</Badge>
                        </div>
                        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                          <KeywordChoiceField
                            id="kw-edit-follower-op"
                            label="比较方式"
                            value={followerOp}
                            options={[
                              { value: "", label: "未选择" },
                              ...COMP_OPTIONS,
                            ]}
                            onValueChange={setFollowerOp}
                            placeholder="未选择"
                            testId="keyword-edit-follower-op"
                            helperText="可选"
                          />
                          <div className="flex flex-col gap-1.5">
                            <label
                              className="text-xs font-medium text-muted-foreground"
                              htmlFor="kw-edit-follower-value"
                            >
                              数值
                            </label>
                            <Input
                              id="kw-edit-follower-value"
                              type="number"
                              min={1}
                              step={1}
                              value={followerValue}
                              onChange={(e) => setFollowerValue(e.target.value)}
                              data-testid="keyword-edit-follower-value"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <label
                            className="text-xs font-medium text-muted-foreground"
                            htmlFor="kw-edit-like-op"
                          >
                            {keywordsStrings.fieldLikeThreshold}
                          </label>
                          <Badge variant="secondary">点赞</Badge>
                        </div>
                        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                          <KeywordChoiceField
                            id="kw-edit-like-op"
                            label="比较方式"
                            value={likeOp}
                            options={[
                              { value: "", label: "未选择" },
                              ...COMP_OPTIONS,
                            ]}
                            onValueChange={setLikeOp}
                            placeholder="未选择"
                            testId="keyword-edit-like-op"
                            helperText="可选"
                          />
                          <div className="flex flex-col gap-1.5">
                            <label
                              className="text-xs font-medium text-muted-foreground"
                              htmlFor="kw-edit-like-value"
                            >
                              数值
                            </label>
                            <Input
                              id="kw-edit-like-value"
                              type="number"
                              min={1}
                              step={1}
                              value={likeValue}
                              onChange={(e) => setLikeValue(e.target.value)}
                              data-testid="keyword-edit-like-value"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <p className="text-xs text-muted-foreground">{keywordsStrings.fieldsHelp}</p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="border-t border-border bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {keywordsStrings.cancelButton}
            </Button>
            <Button
              type="submit"
              disabled={isPending || text.trim().length === 0}
              data-testid="keyword-edit-submit"
            >
              {keywordsStrings.confirmButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
