import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bnError } from "@/lib/bn-errors";
import type { OrderRow } from "@/lib/orders";

type Props = {
  order: OrderRow | null;
  onClose: () => void;
};

export function TrackingDialog({ order, onClose }: Props) {
  const queryClient = useQueryClient();
  const [consignment, setConsignment] = useState("");
  const [tracking, setTracking] = useState("");

  useEffect(() => {
    setConsignment(order?.consignment_id ?? "");
    setTracking(order?.tracking_code ?? "");
  }, [order?.id]);

  const save = useMutation({
    mutationFn: async () => {
      if (!order) return;
      const { error } = await supabase
        .from("orders")
        .update({
          consignment_id: consignment.trim() || null,
          tracking_code: tracking.trim() || null,
          is_courier_entered: !!consignment.trim(),
        })
        .eq("id", order.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("কুরিয়ার তথ্য সেভ হয়েছে।");
      void queryClient.invalidateQueries({ queryKey: ["order-list"] });
      void queryClient.invalidateQueries({ queryKey: ["order-list-counts"] });
      onClose();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "কুরিয়ার তথ্য সেভ করা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> কুরিয়ার এন্ট্রি
          </DialogTitle>
          <DialogDescription>
            কনসাইনমেন্ট আইডি দিলে অর্ডারটি “এন্ট্রি হয়েছে” হিসেবে চিহ্নিত হবে।
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">কনসাইনমেন্ট আইডি</Label>
            <Input value={consignment} onChange={(e) => setConsignment(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ট্র্যাকিং কোড</Label>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            বাতিল
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            সেভ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
