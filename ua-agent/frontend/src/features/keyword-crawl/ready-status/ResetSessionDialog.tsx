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

import { useResetSession } from "./useResetSession";

interface ResetSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetSessionDialog({ open, onOpenChange }: ResetSessionDialogProps): JSX.Element {
  const mutation = useResetSession();

  async function onConfirm(): Promise<void> {
    const result = await mutation.mutateAsync();
    if (result.ok) {
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>清除登录态</AlertDialogTitle>
          <AlertDialogDescription>
            该操作会同时清除抖音与小红书的登录态及 patchright 反爬指纹，但已采集素材会原样保留。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>取消</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            确认清除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
