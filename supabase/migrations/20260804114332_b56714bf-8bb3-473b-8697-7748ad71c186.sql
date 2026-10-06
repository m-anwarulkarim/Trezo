REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_order_staff(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_order_status_counts(text[], timestamptz, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_order_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status_counts(text[], timestamptz, text) TO authenticated;