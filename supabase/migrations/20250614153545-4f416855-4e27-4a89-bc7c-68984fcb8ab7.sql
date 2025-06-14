-- Enable realtime for narocila table
ALTER TABLE public.narocila REPLICA IDENTITY FULL;

-- Add narocila table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.narocila;