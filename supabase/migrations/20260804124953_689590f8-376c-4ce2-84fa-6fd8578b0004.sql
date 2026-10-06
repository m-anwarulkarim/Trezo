ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pre_date date;

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place an order"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND is_printed = false
  AND is_courier_entered = false
  AND is_deleted = false
  AND consignment_id IS NULL
  AND tracking_code IS NULL
  AND last_status_changed_by IS NULL
  AND pre_date IS NULL
  AND discount = 0
  AND advance = 0
  AND delivery_charge >= 0 AND delivery_charge <= 500
  AND subtotal >= 0 AND subtotal <= 1000000
  AND total_amount >= 0 AND total_amount <= 1000000
  AND char_length(customer_name) >= 2 AND char_length(customer_name) <= 120
  AND char_length(phone) >= 6 AND char_length(phone) <= 20
  AND char_length(address) >= 5 AND char_length(address) <= 500
  AND (alt_phone IS NULL OR char_length(alt_phone) <= 20)
  AND (note IS NULL OR char_length(note) <= 500)
  AND (delivery_area IS NULL OR char_length(delivery_area) <= 50)
  AND (traffic_source IS NULL OR char_length(traffic_source) <= 100)
  AND char_length(order_id) >= 3 AND char_length(order_id) <= 40
  AND (customer_facing_id IS NULL OR char_length(customer_facing_id) <= 40)
);