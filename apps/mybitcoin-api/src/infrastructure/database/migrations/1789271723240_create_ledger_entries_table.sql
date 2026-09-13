-- Migration: create_ledger_entries_table
-- Created at: 2026-09-13T00:00:01.000Z

CREATE TABLE ledger_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id),
  account         VARCHAR(255) NOT NULL,
  type            VARCHAR(16) NOT NULL,
  amount_satoshi  BIGINT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_transaction_id ON ledger_entries (transaction_id);
