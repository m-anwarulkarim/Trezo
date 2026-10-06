CREATE UNIQUE INDEX tracking_events_one_successful_purchase_per_order
ON public.tracking_events (order_id)
WHERE event_name = 'Purchase'
  AND success = true
  AND is_test = false
  AND order_id IS NOT NULL;