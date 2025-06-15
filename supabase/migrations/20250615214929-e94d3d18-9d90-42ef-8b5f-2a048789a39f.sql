-- Phase 1: Database Security Foundation

-- Create security audit logging table
CREATE TABLE public.security_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create failed login attempts tracking
CREATE TABLE public.failed_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT
);

-- Add validation triggers for business rules

-- Function to validate order quantities (1-50 items)
CREATE OR REPLACE FUNCTION validate_order_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.kolicina < 1 OR NEW.kolicina > 50 THEN
    RAISE EXCEPTION 'Invalid order quantity: must be between 1 and 50 items';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate food prices (€0.50-€100)
CREATE OR REPLACE FUNCTION validate_food_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cena < 0.50 OR NEW.cena > 100.00 THEN
    RAISE EXCEPTION 'Invalid food price: must be between €0.50 and €100.00';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate email format
CREATE OR REPLACE FUNCTION validate_email_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate phone number format
CREATE OR REPLACE FUNCTION validate_phone_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.telefon IS NOT NULL AND NEW.telefon !~ '^[\+]?[0-9\s\-\(\)]{8,20}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate text lengths
CREATE OR REPLACE FUNCTION validate_text_lengths()
RETURNS TRIGGER AS $$
BEGIN
  -- Check various text field lengths based on table
  IF TG_TABLE_NAME = 'profili' THEN
    IF LENGTH(NEW.ime) > 100 OR LENGTH(NEW.priimek) > 100 THEN
      RAISE EXCEPTION 'Name fields cannot exceed 100 characters';
    END IF;
  ELSIF TG_TABLE_NAME = 'restavracije' THEN
    IF LENGTH(NEW.naziv) > 100 THEN
      RAISE EXCEPTION 'Restaurant name cannot exceed 100 characters';
    END IF;
    IF NEW.opis IS NOT NULL AND LENGTH(NEW.opis) > 1000 THEN
      RAISE EXCEPTION 'Restaurant description cannot exceed 1000 characters';
    END IF;
  ELSIF TG_TABLE_NAME = 'jedi' THEN
    IF LENGTH(NEW.ime) > 100 THEN
      RAISE EXCEPTION 'Food name cannot exceed 100 characters';
    END IF;
    IF NEW.opis IS NOT NULL AND LENGTH(NEW.opis) > 500 THEN
      RAISE EXCEPTION 'Food description cannot exceed 500 characters';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit (user_id, event_type, event_data, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check failed login attempts
CREATE OR REPLACE FUNCTION check_failed_login_attempts(p_email TEXT, p_ip_address INET)
RETURNS INTEGER AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM public.failed_login_attempts
  WHERE (email = p_email OR ip_address = p_ip_address)
    AND attempt_time > (now() - INTERVAL '15 minutes');
  
  RETURN attempt_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login_attempt(
  p_email TEXT,
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.failed_login_attempts (email, ip_address, user_agent)
  VALUES (p_email, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for validation

-- Order quantity validation
CREATE TRIGGER validate_order_quantity_trigger
  BEFORE INSERT OR UPDATE ON public.postavke_narocila
  FOR EACH ROW EXECUTE FUNCTION validate_order_quantity();

-- Food price validation
CREATE TRIGGER validate_food_price_trigger
  BEFORE INSERT OR UPDATE ON public.jedi
  FOR EACH ROW EXECUTE FUNCTION validate_food_price();

-- Email validation for profiles
CREATE TRIGGER validate_email_format_trigger
  BEFORE INSERT OR UPDATE ON public.profili
  FOR EACH ROW EXECUTE FUNCTION validate_email_format();

-- Email validation for restaurants
CREATE TRIGGER validate_restaurant_email_format_trigger
  BEFORE INSERT OR UPDATE ON public.restavracije
  FOR EACH ROW EXECUTE FUNCTION validate_email_format();

-- Phone validation for profiles
CREATE TRIGGER validate_phone_format_trigger
  BEFORE INSERT OR UPDATE ON public.profili
  FOR EACH ROW EXECUTE FUNCTION validate_phone_format();

-- Text length validation triggers
CREATE TRIGGER validate_profili_text_lengths_trigger
  BEFORE INSERT OR UPDATE ON public.profili
  FOR EACH ROW EXECUTE FUNCTION validate_text_lengths();

CREATE TRIGGER validate_restavracije_text_lengths_trigger
  BEFORE INSERT OR UPDATE ON public.restavracije
  FOR EACH ROW EXECUTE FUNCTION validate_text_lengths();

CREATE TRIGGER validate_jedi_text_lengths_trigger
  BEFORE INSERT OR UPDATE ON public.jedi
  FOR EACH ROW EXECUTE FUNCTION validate_text_lengths();

-- Enable RLS on security tables
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for security tables (admin access only)
CREATE POLICY "Only admins can view security audit"
  ON public.security_audit FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profili 
    WHERE user_id = auth.uid() AND vloga = 'admin_restavracije'
  ));

CREATE POLICY "Only admins can view failed login attempts"
  ON public.failed_login_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profili 
    WHERE user_id = auth.uid() AND vloga = 'admin_restavracije'
  ));

-- Add indexes for performance
CREATE INDEX idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX idx_security_audit_event_type ON public.security_audit(event_type);
CREATE INDEX idx_security_audit_created_at ON public.security_audit(created_at);
CREATE INDEX idx_failed_login_email ON public.failed_login_attempts(email);
CREATE INDEX idx_failed_login_ip ON public.failed_login_attempts(ip_address);
CREATE INDEX idx_failed_login_time ON public.failed_login_attempts(attempt_time);