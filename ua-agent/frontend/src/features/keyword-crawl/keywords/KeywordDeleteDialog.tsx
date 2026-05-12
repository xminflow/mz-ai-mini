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

import { keywordsStrings } from "./strings";
import { useKeywordDelete } from "./useKeywordDelete";

interface KeywordDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keywordId: string;
  keywordText: string;
}

export function KeywordDeleteDialog({
  open,
  onOpenChange,
  keywordId,
  keywordText,
}: KeywordDeleteDialogProps): JSX.Element {
  const mutation = useKeywordDelete();

  async function onConfirm(): Promise<void> {
    const result = await mutation.mutateAsync({ id: keywordId });
    if (result.ok) {
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{keywordsStrings.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {keywordsStrings.deleteConfirmBody(keywordText)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {keywordsStrings.cancelButton}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {keywordsStrings.confirmButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
