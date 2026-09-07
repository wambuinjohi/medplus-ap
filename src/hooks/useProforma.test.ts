import { normalizeProformaDate } from './useProforma';

describe('normalizeProformaDate', () => {
  it('retains valid date-only values', () => {
    expect(normalizeProformaDate('2025-06-15', 'Valid until')).toBe('2025-06-15');
  });

  it('converts blank optional values to null', () => {
    expect(normalizeProformaDate('', 'Valid until')).toBeNull();
    expect(normalizeProformaDate('  ', 'Expiry date')).toBeNull();
    expect(normalizeProformaDate(null, 'Expiry date')).toBeNull();
  });

  it('rejects malformed and impossible dates', () => {
    expect(() => normalizeProformaDate('15/06/2025', 'Valid until')).toThrow(
      'Valid until must be a valid date',
    );
    expect(() => normalizeProformaDate('2025-02-29', 'Expiry date')).toThrow(
      'Expiry date must be a valid date',
    );
  });

  it('rejects a blank required date', () => {
    expect(() => normalizeProformaDate('', 'Proforma date', true)).toThrow(
      'Proforma date is required',
    );
  });
});
