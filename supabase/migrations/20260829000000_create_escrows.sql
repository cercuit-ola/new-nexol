CREATE TYPE public.escrow_status AS ENUM (
  'draft',
  'awaiting_funding',
  'funded',
  'work_submitted',
  'released',
  'disputed',
  'cancelled'
);

CREATE TABLE public.escrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  creator_email text NOT NULL,
  counterparty_email text NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  amount numeric(20, 6) NOT NULL CHECK (amount > 0),
  token text NOT NULL DEFAULT 'USDC' CHECK (token IN ('USDC', 'USDT')),
  network text NOT NULL DEFAULT 'base' CHECK (network IN ('base', 'base-sepolia')),
  deadline timestamptz,
  status public.escrow_status NOT NULL DEFAULT 'awaiting_funding',
  funding_tx_hash text,
  release_tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (lower(creator_email) <> lower(counterparty_email))
);

CREATE INDEX escrows_creator_id_idx ON public.escrows (creator_id, created_at DESC);
CREATE INDEX escrows_counterparty_email_idx ON public.escrows (lower(counterparty_email), created_at DESC);

ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escrow parties can view agreements"
ON public.escrows FOR SELECT TO authenticated
USING (
  auth.uid() = creator_id
  OR lower(counterparty_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Authenticated users can create escrows"
ON public.escrows FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = creator_id
  AND lower(creator_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  AND status = 'awaiting_funding'
  AND funding_tx_hash IS NULL
  AND release_tx_hash IS NULL
);

CREATE TRIGGER update_escrows_updated_at
BEFORE UPDATE ON public.escrows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

