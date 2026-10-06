CREATE TABLE public.tracking_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  pixel_id text,
  access_token text,
  test_event_code text,
  pixel_enabled boolean NOT NULL DEFAULT true,
  capi_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tracking_settings TO authenticated;
GRANT ALL ON public.tracking_settings TO service_role;

ALTER TABLE public.tracking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view tracking settings" ON public.tracking_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert tracking settings" ON public.tracking_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tracking settings" ON public.tracking_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.tracking_settings (id) VALUES (true);

CREATE TRIGGER update_tracking_settings_updated_at
  BEFORE UPDATE ON public.tracking_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_id text,
  order_id text,
  value numeric,
  currency text,
  success boolean NOT NULL DEFAULT false,
  is_test boolean NOT NULL DEFAULT false,
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view tracking events" ON public.tracking_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_public_pixel_settings()
RETURNS TABLE(pixel_id text, pixel_enabled boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT t.pixel_id, t.pixel_enabled FROM public.tracking_settings t WHERE t.id LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_pixel_settings() TO anon, authenticated;