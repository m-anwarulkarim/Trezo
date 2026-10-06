
CREATE OR REPLACE FUNCTION public.order_exists(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders WHERE id = _order_id)
$$;

REVOKE ALL ON FUNCTION public.order_exists(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.order_exists(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place an order"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'confirmed'
  AND is_printed = false
  AND is_courier_entered = false
  AND is_deleted = false
  AND consignment_id IS NULL
  AND tracking_code IS NULL
  AND last_status_changed_by IS NULL
  AND discount = 0
  AND advance = 0
  AND delivery_charge >= 0 AND delivery_charge <= 500
  AND subtotal >= 0 AND subtotal <= 1000000
  AND total_amount >= 0 AND total_amount <= 1000000
  AND char_length(customer_name) BETWEEN 2 AND 120
  AND char_length(phone) BETWEEN 6 AND 20
  AND char_length(address) BETWEEN 5 AND 500
  AND (alt_phone IS NULL OR char_length(alt_phone) <= 20)
  AND (note IS NULL OR char_length(note) <= 500)
  AND (delivery_area IS NULL OR char_length(delivery_area) <= 50)
  AND (traffic_source IS NULL OR char_length(traffic_source) <= 100)
  AND char_length(order_id) BETWEEN 3 AND 40
  AND (customer_facing_id IS NULL OR char_length(customer_facing_id) <= 40)
);

DROP POLICY IF EXISTS "Anyone can add order items" ON public.order_items;
CREATE POLICY "Anyone can add order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.order_exists(order_id)
  AND quantity >= 1 AND quantity <= 1000
  AND unit_price >= 0 AND unit_price <= 1000000
  AND char_length(product_name) BETWEEN 1 AND 200
  AND (product_image IS NULL OR char_length(product_image) <= 500)
);
