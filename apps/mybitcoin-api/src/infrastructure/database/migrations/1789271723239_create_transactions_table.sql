-- Migration: create_transactions_table
-- Created at: 2026-09-13T00:00:00.000Z

CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL,
  type            VARCHAR(32) NOT NULL,
  amount_satoshi  BIGINT NOT NULL,
  status          VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_account_id ON transactions (account_id);
