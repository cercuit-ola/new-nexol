ALTER TYPE public.escrow_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE public.escrow_status ADD VALUE IF NOT EXISTS 'resolved';

ALTER TABLE public.escrows
  ADD COLUMN IF NOT EXISTS payer_wallet text,
  ADD COLUMN IF NOT EXISTS payee_wallet text,
  ADD COLUMN IF NOT EXISTS chain_id bigint,
  ADD COLUMN IF NOT EXISTS contract_address text,
  ADD COLUMN IF NOT EXISTS contract_escrow_id bigint,
  ADD COLUMN IF NOT EXISTS metadata_hash text,
  ADD COLUMN IF NOT EXISTS dispute_tx_hash text;

ALTER TABLE public.payment_schedules
  ADD COLUMN IF NOT EXISTS payer_wallet text,
  ADD COLUMN IF NOT EXISTS recipient_wallet text,
  ADD COLUMN IF NOT EXISTS chain_id bigint,
  ADD COLUMN IF NOT EXISTS contract_address text,
  ADD COLUMN IF NOT EXISTS contract_schedule_id bigint,
  ADD COLUMN IF NOT EXISTS metadata_hash text,
  ADD COLUMN IF NOT EXISTS creation_tx_hash text,
  ADD COLUMN IF NOT EXISTS cancellation_tx_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS escrows_chain_contract_id_idx
  ON public.escrows (chain_id, contract_address, contract_escrow_id)
  WHERE contract_escrow_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS schedules_chain_contract_id_idx
  ON public.payment_schedules (chain_id, contract_address, contract_schedule_id)
  WHERE contract_schedule_id IS NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can create escrows" ON public.escrows;
CREATE POLICY "Authenticated users can record funded escrows"
ON public.escrows FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creator_id AND status IN ('awaiting_funding', 'funded'));

DROP POLICY IF EXISTS "Users can create their schedules" ON public.payment_schedules;
CREATE POLICY "Users can record their schedules"
ON public.payment_schedules FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND released_count = 0 AND status IN ('scheduled', 'active'));

COMMENT ON COLUMN public.escrows.metadata_hash IS 'keccak256 hash committed in the escrow contract';
COMMENT ON COLUMN public.payment_schedules.metadata_hash IS 'keccak256 hash committed in the scheduler contract';
