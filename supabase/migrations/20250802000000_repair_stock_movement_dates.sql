-- Keep stock movement inserts safe on deployments where movement_date was created without a default.
UPDATE stock_movements
SET movement_date = CURRENT_DATE
WHERE movement_date IS NULL;

ALTER TABLE stock_movements
  ALTER COLUMN movement_date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN movement_date SET NOT NULL;

ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_reference_type_check;
ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_reference_type_check
  CHECK (reference_type IN (
    'INVOICE',
    'INVOICE_REVERSAL',
    'DELIVERY_NOTE',
    'RESTOCK',
    'ADJUSTMENT',
    'CREDIT_NOTE',
    'CREDIT_NOTE_REVERSAL',
    'PURCHASE'
  ));
