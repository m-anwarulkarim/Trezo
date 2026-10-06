DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE customer_name = 'টেস্ট ক্রেতা');
DELETE FROM public.orders WHERE customer_name = 'টেস্ট ক্রেতা';
DELETE FROM public.tracking_events;
UPDATE public.tracking_settings SET pixel_id = NULL, access_token = NULL WHERE id;