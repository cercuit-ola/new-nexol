CREATE TYPE public.payment_schedule_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');

CREATE TABLE public.payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 120),
  recipient_email text,
  total_amount numeric(20, 6) NOT NULL CHECK (total_amount > 0),
  installment_amount numeric(20, 6) NOT NULL CHECK (installment_amount > 0),
  installment_count integer NOT NULL CHECK (installment_count BETWEEN 2 AND 52),
  interval_days integer NOT NULL CHECK (interval_days BETWEEN 1 AND 365),
  token text NOT NULL DEFAULT 'USDC' CHECK (token IN ('USDC', 'USDT')),
  starts_at timestamptz NOT NULL,
  next_release_at timestamptz NOT NULL,
  released_count integer NOT NULL DEFAULT 0 CHECK (released_count >= 0),
  status public.payment_schedule_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (released_count <= installment_count)
);

ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their schedules" ON public.payment_schedules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their schedules" ON public.payment_schedules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND released_count = 0 AND status = 'scheduled');
CREATE POLICY "Users can cancel unfunded schedules" ON public.payment_schedules FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'scheduled')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

CREATE TRIGGER update_payment_schedules_updated_at BEFORE UPDATE ON public.payment_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

