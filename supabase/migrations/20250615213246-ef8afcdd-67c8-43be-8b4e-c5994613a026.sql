-- Enable realtime for restaurants table
ALTER TABLE public.restavracije REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restavracije;