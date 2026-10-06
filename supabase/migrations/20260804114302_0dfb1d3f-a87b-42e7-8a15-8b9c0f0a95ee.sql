CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_order_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  customer_facing_id text,
  customer_name text NOT NULL,
  phone text NOT NULL,
  alt_phone text,
  address text NOT NULL,
  note text,
  print_note boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'confirmed',
  delivery_area text,
  delivery_charge numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  advance numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  is_printed boolean NOT NULL DEFAULT false,
  is_courier_entered boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  consignment_id text,
  tracking_code text,
  traffic_source text,
  last_status_changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_phone_idx ON public.orders (phone);

GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can view orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_order_staff(auth.uid()));
CREATE POLICY "Staff can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_order_staff(auth.uid()))
  WITH CHECK (public.is_order_staff(auth.uid()));
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

GRANT INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add order items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can view order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_order_staff(auth.uid()));
CREATE POLICY "Staff can update order items" ON public.order_items
  FOR UPDATE TO authenticated USING (public.is_order_staff(auth.uid()))
  WITH CHECK (public.is_order_staff(auth.uid()));
CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid,
  changed_by_name text,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_status_history_order_id_idx ON public.order_status_history (order_id);

GRANT SELECT, INSERT ON public.order_status_history TO authenticated;
GRANT ALL ON public.order_status_history TO service_role;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view status history" ON public.order_status_history
  FOR SELECT TO authenticated USING (public.is_order_staff(auth.uid()));
CREATE POLICY "Staff can add status history" ON public.order_status_history
  FOR INSERT TO authenticated WITH CHECK (public.is_order_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_order_status_counts(
  p_statuses text[], p_date_from timestamptz DEFAULT NULL, p_search text DEFAULT NULL
)
RETURNS TABLE (status text, cnt bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.status, count(*)::bigint AS cnt
  FROM public.orders o
  WHERE public.is_order_staff(auth.uid())
    AND o.is_deleted = false
    AND o.status = ANY(p_statuses)
    AND (p_date_from IS NULL OR o.created_at >= p_date_from)
    AND (
      p_search IS NULL OR p_search = '' OR
      o.order_id ILIKE '%' || p_search || '%' OR
      coalesce(o.customer_facing_id, '') ILIKE '%' || p_search || '%' OR
      o.customer_name ILIKE '%' || p_search || '%' OR
      o.phone ILIKE '%' || p_search || '%'
    )
  GROUP BY o.status;
$$;
GRANT EXECUTE ON FUNCTION public.get_order_status_counts(text[], timestamptz, text) TO authenticated;