# Simon Invoicing System Enhancement Plan
## Implementation Guide & SQL Reference

### Executive Summary
This document provides the complete implementation roadmap for three critical enhancements to the invoicing system:
1. **Bank Details Management** - Make bank details editable and visible in statements
2. **Overdue vs Current Distinction** - Clear visual separation in statements
3. **Excel Aging Analysis** - Add aging bucket breakdown to Excel exports

---

## Feature 1: Bank Details Management

### Current State
- Bank details are hardcoded in `src/utils/pdfGenerator.ts`
- Hardcoded values: Account Name: MEDPLUS AFRICA LIMITED, Bank: ABSA BANK, Account No: 2047138798, etc.
- Not stored in database or company settings
- Not visible in customer statements

### SQL Implementation

**Database Schema** (already in place, verified in database-schema.sql):
```sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS paybill_number VARCHAR(20);
```

**Migration File**: `supabase/migrations/20250305000000_add_bank_details_columns.sql` ✓ CREATED

### Code Changes Required

#### 1. Update CompanySettings Component
**File**: `src/pages/settings/CompanySettings.tsx`

**Current Status**: Component already has bank fields in state (lines 45-50):
```typescript
bank_name: '',
bank_account_number: '',
bank_account_name: '',
swift_code: '',
branch_code: '',
paybill_number: ''
```

**Changes Needed**:
- Add collapsible Bank Details section in the form UI (after address fields)
- Create input fields for each bank detail
- Add save/update logic via existing `updateCompany` hook
- Add validation for bank fields (optional but recommended)

**Priority**: HIGH | **Effort**: MEDIUM | **Status**: PARTIALLY COMPLETE

#### 2. Update PDF Generator
**File**: `src/utils/pdfGenerator.ts`

**Current State**: Lines ~150-160 contain hardcoded bank details

**Changes Needed**:
```typescript
// Replace hardcoded bank details with company data
interface CompanyDetails {
  name: string;
  registration_number?: string;
  tax_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bank_name?: string;           // ADD
  bank_account_number?: string; // ADD
  bank_account_name?: string;   // ADD
  swift_code?: string;          // ADD
  branch_code?: string;         // ADD
  paybill_number?: string;      // ADD
}

// In PDF generation function:
const bankDetails = company?.bank_name || 'Not configured';
const accountNumber = company?.bank_account_number || 'N/A';
const accountName = company?.bank_account_name || 'N/A';
```

**Priority**: HIGH | **Effort**: LOW | **Status**: NOT STARTED

#### 3. Update CustomerStatementPreviewModal
**File**: `src/components/statements/CustomerStatementPreviewModal.tsx`

**Changes Needed**:
- Add bank details section below transaction table
- Display bank information with same formatting as PDF
- Show bank details only if configured

**Implementation**:
```typescript
// Add after Outstanding Invoices table:
{company?.bank_name && (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-sm">Bank Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Bank Name</p>
          <p className="font-semibold">{company.bank_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Account Name</p>
          <p className="font-semibold">{company.bank_account_name || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Account Number</p>
          <p className="font-semibold">{company.bank_account_number || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">SWIFT Code</p>
          <p className="font-semibold">{company.swift_code || '-'}</p>
        </div>
        {company.branch_code && (
          <div>
            <p className="text-xs text-gray-500">Branch Code</p>
            <p className="font-semibold">{company.branch_code}</p>
          </div>
        )}
        {company.paybill_number && (
          <div>
            <p className="text-xs text-gray-500">M-Pesa Paybill</p>
            <p className="font-semibold">{company.paybill_number}</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)}
```

**Priority**: MEDIUM | **Effort**: LOW | **Status**: NOT STARTED

---

## Feature 2: Clear Overdue vs Current Distinction

### Current State
- Aging analysis exists in `CustomerStatements.tsx` and `StatementOfAccounts.tsx`
- `CustomerStatementPreviewModal` shows aging buckets (Current, 1-30, 31-60, etc.)
- **Missing**: Visual indicators for individual invoice status (current vs overdue)

### Implementation Plan

#### 1. Enhance CustomerStatementPreviewModal
**File**: `src/components/statements/CustomerStatementPreviewModal.tsx`

**Current Implementation** (lines 51-77):
- Aging calculations are already present and working correctly
- Buckets: current, days30, days60, days90, over90
- Status badge function exists (line 79)

**Changes Needed**:

**A. Add Aging Summary Section at Top**:
```typescript
<Card className="mb-6">
  <CardHeader>
    <CardTitle className="text-sm">Aging Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      <div className="border-r pr-4">
        <p className="text-xs text-gray-500">Current</p>
        <p className="text-lg font-bold text-green-600">
          {customer.currency || 'KES'} {aging.current.toFixed(2)}
        </p>
      </div>
      <div className="border-r pr-4">
        <p className="text-xs text-gray-500">Overdue (Total)</p>
        <p className="text-lg font-bold text-red-600">
          {customer.currency || 'KES'} {(aging.days30 + aging.days60 + aging.days90 + aging.over90).toFixed(2)}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Total Outstanding</p>
        <p className="text-lg font-bold text-gray-800">
          {customer.currency || 'KES'} {customer.total_outstanding.toFixed(2)}
        </p>
      </div>
    </div>
    
    {/* Aging Bucket Details */}
    <div className="grid grid-cols-5 gap-2 mt-4 text-xs">
      <div>
        <p className="text-gray-500">0-30 Days</p>
        <p className="font-semibold">{aging.days30.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-gray-500">31-60 Days</p>
        <p className="font-semibold">{aging.days60.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-gray-500">61-90 Days</p>
        <p className="font-semibold">{aging.days90.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-gray-500">90+ Days</p>
        <p className="font-semibold text-red-600">{aging.over90.toFixed(2)}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

**B. Enhanced Outstanding Invoices Table**:
```typescript
// In the Outstanding Invoices table, modify the row to include status:
<TableRow key={inv.id}>
  <TableCell>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
  <TableCell>{inv.invoice_number}</TableCell>
  <TableCell className="text-right">{(inv.total_amount - (inv.paid_amount || 0)).toFixed(2)}</TableCell>
  <TableCell>
    {getStatusBadge(
      Math.floor((today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)),
      inv.total_amount - (inv.paid_amount || 0)
    )}
  </TableCell>
  <TableCell className="text-center">
    <Button variant="ghost" size="sm" onClick={() => viewInvoice(inv.id)}>
      View
    </Button>
  </TableCell>
</TableRow>
```

**C. Add Sorting & Filtering** (Optional):
```typescript
const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
const [filterStatus, setFilterStatus] = useState<'all' | 'current' | 'overdue'>('all');

const filteredInvoices = outstandingInvoices
  .filter(inv => {
    if (filterStatus === 'all') return true;
    const daysOverdue = Math.floor((today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
    return filterStatus === 'overdue' ? daysOverdue > 0 : daysOverdue <= 0;
  })
  .sort((a, b) => {
    // Sort implementation
  });
```

**Priority**: HIGH | **Effort**: MEDIUM | **Status**: PARTIALLY COMPLETE

#### 2. Verify Aging Calculations
**File**: `src/utils/pdfGenerator.ts`

**Requirement**: Ensure aging logic in pdfGenerator matches csvExporter

**Current Aging Logic** (CustomerStatementPreviewModal lines 61-77):
```typescript
outstandingInvoices.forEach(inv => {
  const dueDate = new Date(inv.due_date);
  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const outstanding = inv.total_amount - (inv.paid_amount || 0);

  if (daysOverdue <= 0) {
    aging.current += outstanding;
  } else if (daysOverdue <= 30) {
    aging.days30 += outstanding;
  } else if (daysOverdue <= 60) {
    aging.days60 += outstanding;
  } else if (daysOverdue <= 90) {
    aging.days90 += outstanding;
  } else {
    aging.over90 += outstanding;
  }
});
```

**Action**: Extract to utility function for reuse across components.

**Priority**: MEDIUM | **Effort**: LOW | **Status**: NOT STARTED

---

## Feature 3: Excel Aging Analysis

### Current State
- Excel exports use HTML-to-.xls format via `csvExporter.ts`
- `exportCustomerStatementsToExcel()` exists but doesn't include detailed aging buckets
- `exportDataToExcelWithAgingSummary()` has basic aging (Current/Overdue) - lines 104-222
- PDF statements show aging, Excel should match

### SQL Aging Bucket Query (Reference)

For future database-driven aging analysis:
```sql
-- Aging analysis by customer
SELECT
  c.id,
  c.name,
  c.customer_code,
  
  -- Aging buckets
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) <= 0 
    THEN i.total_amount - COALESCE(p.paid_amount, 0)
    ELSE 0 
  END), 0) AS current_amount,
  
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 0 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 30
    THEN i.total_amount - COALESCE(p.paid_amount, 0)
    ELSE 0 
  END), 0) AS days_1_30,
  
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 30 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 60
    THEN i.total_amount - COALESCE(p.paid_amount, 0)
    ELSE 0 
  END), 0) AS days_31_60,
  
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 60 
    AND EXTRACT(DAY FROM NOW() - i.due_date) <= 90
    THEN i.total_amount - COALESCE(p.paid_amount, 0)
    ELSE 0 
  END), 0) AS days_61_90,
  
  COALESCE(SUM(CASE 
    WHEN EXTRACT(DAY FROM NOW() - i.due_date) > 90
    THEN i.total_amount - COALESCE(p.paid_amount, 0)
    ELSE 0 
  END), 0) AS days_90_plus
  
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id
LEFT JOIN (
  SELECT invoice_id, SUM(amount) as paid_amount
  FROM payments
  GROUP BY invoice_id
) p ON i.id = p.invoice_id
WHERE c.company_id = 'YOUR_COMPANY_ID'
GROUP BY c.id, c.name, c.customer_code
ORDER BY current_amount + days_1_30 + days_31_60 + days_61_90 + days_90_plus DESC;
```

### Implementation Plan

#### 1. Enhance Excel Export Function
**File**: `src/utils/csvExporter.ts`

**Current State**: `exportDataToExcelWithAgingSummary()` (lines 104-222) includes:
- Company header info
- Basic aging summary (Current/Overdue/Total)
- Customer details table

**Enhancement Needed**: Add detailed aging bucket breakdown

**Modified Function**:
```typescript
export const exportCustomerStatementDetailToExcel = (
  customer: CustomerStatementData,
  invoices: Invoice[],
  options?: ExcelExportOptions
) => {
  // Existing imports and setup...
  const filename = `customer-statement-${customer.customer_name}-${new Date().toISOString().split('T')[0]}.xls`;
  
  // Calculate aging buckets for this customer
  const agingBuckets = calculateAgingBuckets(invoices);
  
  // Build HTML with aging sections
  const html = buildExcelHtml({
    companyInfo: options?.companyInfo,
    customer,
    agingBuckets,
    invoices,
    headers: ['Invoice #', 'Date', 'Due Date', 'Amount', 'Paid', 'Outstanding', 'Status']
  });
  
  // Export
  downloadExcel(html, filename);
};

// Helper function to calculate aging buckets
function calculateAgingBuckets(invoices: Invoice[]) {
  const today = new Date();
  const buckets = {
    current: { amount: 0, invoices: [] },
    days_1_30: { amount: 0, invoices: [] },
    days_31_60: { amount: 0, invoices: [] },
    days_61_90: { amount: 0, invoices: [] },
    days_90_plus: { amount: 0, invoices: [] }
  };
  
  invoices.forEach(inv => {
    const outstanding = inv.total_amount - (inv.paid_amount || 0);
    if (outstanding <= 0) return; // Skip paid invoices
    
    const daysOverdue = Math.floor(
      (today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let bucket = buckets.current;
    if (daysOverdue > 0 && daysOverdue <= 30) bucket = buckets.days_1_30;
    else if (daysOverdue > 30 && daysOverdue <= 60) bucket = buckets.days_31_60;
    else if (daysOverdue > 60 && daysOverdue <= 90) bucket = buckets.days_61_90;
    else if (daysOverdue > 90) bucket = buckets.days_90_plus;
    
    bucket.amount += outstanding;
    bucket.invoices.push(inv);
  });
  
  return buckets;
}
```

**HTML Template Addition**:
```html
<!-- Aging Summary Section -->
<tr>
  <td colspan="7" style="font-size: 12pt; font-weight: bold; padding: 10pt;">
    AGING ANALYSIS
  </td>
</tr>
<tr style="background-color: #f0f0f0;">
  <td colspan="3" style="border: 1pt solid #ccc; padding: 5pt;">
    <b>Aging Bucket</b>
  </td>
  <td style="border: 1pt solid #ccc; padding: 5pt; text-align: right;">
    <b>Outstanding Amount</b>
  </td>
  <td style="border: 1pt solid #ccc; padding: 5pt;">
    <b>Count</b>
  </td>
  <td colspan="2"></td>
</tr>
<tr>
  <td colspan="3" style="border: 1pt solid #ccc; padding: 5pt;">Current</td>
  <td style="border: 1pt solid #ccc; padding: 5pt; text-align: right; color: green;">
    ${agingBuckets.current.amount.toFixed(2)}
  </td>
  <td style="border: 1pt solid #ccc; padding: 5pt;">
    ${agingBuckets.current.invoices.length}
  </td>
  <td colspan="2"></td>
</tr>
<!-- Repeat for days_1_30, days_31_60, days_61_90, days_90_plus -->
```

**Priority**: HIGH | **Effort**: MEDIUM | **Status**: PARTIALLY COMPLETE

#### 2. Excel Export for Statement Summary
**File**: `src/utils/csvExporter.ts`

**New Function**: `exportCustomerStatementSummaryToExcel()`

```typescript
export const exportCustomerStatementSummaryToExcel = (
  statements: CustomerStatementData[],
  filename?: string,
  options?: ExcelExportOptions
) => {
  // Similar to exportCustomerStatementsToExcel but with per-customer aging breakdown
  
  const rows = statements.map(s => [
    s.customer_name,
    s.customer_email || '',
    s.total_outstanding.toFixed(2),
    s.current_due.toFixed(2),
    s.overdue_amount.toFixed(2),
    s.invoice_count.toString()
  ]);
  
  // Build aging summary with per-customer breakdown
  const agingSection = buildAgingBucketSection(statements);
  
  const html = buildExcelWithAgingBuckets(rows, agingSection, options);
  downloadExcel(html, filename || `statements-summary-${new Date().toISOString().split('T')[0]}.xls`);
};
```

**Priority**: MEDIUM | **Effort**: LOW | **Status**: NOT STARTED

---

## Implementation Execution Order

### Phase 1: Bank Details (Week 1)
1. ✓ SQL Migration - DONE
2. Complete CompanySettings UI enhancements
3. Update pdfGenerator with dynamic bank data
4. Add bank details display to CustomerStatementPreviewModal

### Phase 2: Overdue Distinction (Week 2)
1. Extract aging calculation logic to utility function
2. Enhance CustomerStatementPreviewModal with visual indicators
3. Add sorting/filtering by status (optional)
4. Verify aging calculations consistency

### Phase 3: Excel Aging (Week 3)
1. Enhance `exportCustomerStatementDetailToExcel()` with bucket breakdown
2. Create `exportCustomerStatementSummaryToExcel()`
3. Test Excel exports with various aging scenarios
4. Verify consistency with PDF aging

---

## Key Considerations

### Data Consistency
- **Aging Calculations**: Must match between pdfGenerator, csvExporter, and UI components
- **Currency**: Ensure all exports use company's configured currency
- **Dates**: Use consistent timezone handling (recommend UTC + local conversion)
- **Rounding**: Use 2 decimal places consistently for currency

### Backward Compatibility
- Hardcoded bank details should have fallback for existing statements
- New bank fields are optional (allow NULL in database)
- No breaking changes to existing invoice/statement structures

### UX Best Practices
- Bank Details section in Settings: Make it collapsible/expandable
- Statement Preview: Show bank details near payment instructions
- Excel Exports: Include aging breakdown in summary section
- Visual Hierarchy: Use colors (green=current, red=overdue) consistently

### Testing Checklist

**Bank Details**:
- [ ] Create company without bank details (should show fallback)
- [ ] Add bank details in settings
- [ ] Verify bank details appear in PDF
- [ ] Verify bank details appear in statement preview
- [ ] Verify bank details appear in Excel export
- [ ] Test with partial bank details (e.g., only bank name)

**Overdue Distinction**:
- [ ] Invoice with due_date in past shows "Overdue"
- [ ] Invoice with due_date in future shows "Current"
- [ ] Due today shows as "Current"
- [ ] Aged buckets calculate correctly (1-30, 31-60, 61-90, 90+)
- [ ] Paid invoices don't appear in outstanding list
- [ ] Filter and sort by status work correctly

**Excel Aging**:
- [ ] Aging summary appears at top of export
- [ ] Bucket amounts match statement preview
- [ ] Per-customer aging breakdown is accurate
- [ ] Multiple customers show correct totals
- [ ] Currency formatting is correct
- [ ] Test with customers having 0 outstanding

---

## File Summary & Status

| File | Changes | Status | Effort |
|------|---------|--------|--------|
| `supabase/migrations/20250305000000_add_bank_details_columns.sql` | Create | ✓ DONE | N/A |
| `src/pages/settings/CompanySettings.tsx` | Add bank form section | NOT STARTED | MEDIUM |
| `src/utils/pdfGenerator.ts` | Replace hardcoded with dynamic | NOT STARTED | LOW |
| `src/components/statements/CustomerStatementPreviewModal.tsx` | Add bank display + enhance status badges | PARTIAL | MEDIUM |
| `src/utils/csvExporter.ts` | Enhance with aging buckets | PARTIAL | MEDIUM |
| `src/utils/agingCalculations.ts` (NEW) | Extract shared logic | NOT STARTED | LOW |

---

## Success Criteria

✓ Bank details are editable in Company Settings
✓ Bank details display in customer statements (PDF, HTML preview, Excel)
✓ Each invoice shows clear "Current" or "Overdue" status
✓ Aging summary shows breakdown: Current | 1-30 | 31-60 | 61-90 | 90+
✓ Excel exports include complete aging analysis
✓ All aging calculations consistent across components
✓ Backward compatible with existing data
✓ All tests pass without regression
