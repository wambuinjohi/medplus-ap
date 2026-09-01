import { describe, expect, it } from 'vitest';
import { calculateInvoiceLineTotal, calculateInvoiceTotals } from './taxCalculation';

describe('invoice calculations', () => {
  it('applies percentage and before-VAT discounts before exclusive tax', () => {
    const result = calculateInvoiceLineTotal({
      quantity: 2,
      unit_price: 100,
      discount_percentage: 10,
      discount_before_vat: 5,
      tax_percentage: 16,
      tax_inclusive: false,
    });

    expect(result.subtotal).toBe(200);
    expect(result.discountAmount).toBe(25);
    expect(result.taxableAmount).toBe(175);
    expect(result.taxAmount).toBe(28);
    expect(result.lineTotal).toBe(203);
  });

  it('extracts inclusive tax instead of adding it again', () => {
    const result = calculateInvoiceLineTotal({
      quantity: 1,
      unit_price: 116,
      tax_percentage: 16,
      tax_inclusive: true,
    });

    expect(result.lineTotal).toBe(116);
    expect(result.taxAmount).toBe(16);
    expect(result.taxableAmount).toBe(116);
  });

  it('keeps an explicit zero tax rate tax-free', () => {
    const result = calculateInvoiceLineTotal({
      quantity: 3,
      unit_price: 50,
      tax_percentage: 0,
      tax_inclusive: true,
    });

    expect(result.taxAmount).toBe(0);
    expect(result.lineTotal).toBe(150);
  });

  it('derives document totals from the same line rules', () => {
    const totals = calculateInvoiceTotals([
      { quantity: 1, unit_price: 100, tax_percentage: 0, tax_inclusive: false },
      { quantity: 1, unit_price: 116, tax_percentage: 16, tax_inclusive: true },
    ]);

    expect(totals).toEqual({
      subtotal: 216,
      discountAmount: 0,
      taxAmount: 16,
      totalAmount: 216,
    });
  });
});
