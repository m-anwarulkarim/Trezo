import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export type PathaoEntryProgress = {
  total: number;
  done: number;
  failed: number;
  current: string;
  running: boolean;
  results: { orderId: string; success: boolean; message: string }[];
};

export function PathaoEntryDialog({
  progress,
  onClose,
}: {
  progress: PathaoEntryProgress | null;
  onClose: () => void;
}) {
  const percent = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Dialog open={!!progress} onOpenChange={() => !progress?.running && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pathao কুরিয়ার এন্ট্রি</DialogTitle>
          <DialogDescription>
            {progress?.running
              ? `চলছে... ${progress.done}/${progress.total} — ${progress.current}`
              : "কাজ শেষ হয়েছে। নিচে ফলাফল দেখুন।"}
          </DialogDescription>
        </DialogHeader>

        {progress && (
          <div className="space-y-3">
            <Progress value={percent} />
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-700">সফল: {progress.done - progress.failed}</span>
              <span className="text-destructive">ব্যর্থ: {progress.failed}</span>
            </div>
            <div className="space-y-1.5">
              {progress.results.map((r) => (
                <div key={r.orderId} className="flex items-start gap-2 text-xs">
                  {r.success ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                  )}
                  <span className="font-medium">{r.orderId}</span>
                  <span className="text-muted-foreground">{r.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={progress?.running}>
            {progress?.running ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> অপেক্ষা করুন
              </>
            ) : (
              "বন্ধ করুন"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
