-- Omogoči administratorjem restavracij upravljanje popustov za svoje jedi
CREATE POLICY "Restaurant admins can manage discounts for their food items" 
ON public.popusti 
FOR ALL 
TO authenticated
USING (
  auth.uid() IN (
    SELECT ar.admin_id 
    FROM public.admin_restavracije ar
    JOIN public.jedi j ON j.restavracija_id = ar.restavracija_id
    WHERE j.id = popusti.jed_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT ar.admin_id 
    FROM public.admin_restavracije ar
    JOIN public.jedi j ON j.restavracija_id = ar.restavracija_id
    WHERE j.id = popusti.jed_id
  )
);

-- Omogoči super administratorjem upravljanje vseh popustov  
CREATE POLICY "Super admins can manage all discounts"
ON public.popusti
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profili 
    WHERE user_id = auth.uid() 
    AND vloga = 'admin_restavracije'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profili 
    WHERE user_id = auth.uid() 
    AND vloga = 'admin_restavracije'
  )
);