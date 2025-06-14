-- Enable Row Level Security on priljubljene_jedi table
ALTER TABLE public.priljubljene_jedi ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites table
CREATE POLICY "Users can view their own favorites" 
ON public.priljubljene_jedi 
FOR SELECT 
USING (auth.uid() = uporabnik_id);

CREATE POLICY "Users can create their own favorites" 
ON public.priljubljene_jedi 
FOR INSERT 
WITH CHECK (auth.uid() = uporabnik_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.priljubljene_jedi 
FOR DELETE 
USING (auth.uid() = uporabnik_id);