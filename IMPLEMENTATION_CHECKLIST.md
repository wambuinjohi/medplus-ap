# Implementation Checklist - Simon Invoicing Enhancements

Quick reference for developers implementing the three features.

---

## Feature 1: Bank Details Management

### Step 1: Database Migration ✓ DONE
- [x] Migration file created: `supabase/migrations/20250305000000_add_bank_details_columns.sql`
- [x] Bank fields added to companies table
- [x] Indexes created for performance
- [ ] Run migration in Supabase dashboard

### Step 2: CompanySettings Form UI
**File**: `src/pages/settings/CompanySettings.tsx`

**Checklist**:
- [ ] State already has bank fields (lines 45-50) ✓
- [ ] Add collapsible Card section after address fields
- [ ] Add 6 input fields for bank details:
  - [ ] Bank Name
  - [ ] Account Name
  - [ ] Account Number
  - [ ] SWIFT Code
  - [ ] Branch Code
  - [ ] Paybill Number (optional, for M-Pesa)
- [ ] Bind inputs to `companyData` state
- [ ] Add validation (optional: non-empty strings)
- [ ] Update submit button to include bank fields
- [ ] Add success toast on bank details save
- [ ] Test with empty, partial, and complete bank details

**Code Pattern**:
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      Bank Details
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name */}
      <div>
        <Label>Bank Name</Label>
        <Input
          value={companyData.bank_name}
          onChange={(e) => setCompanyData({...companyData, bank_name: e.target.value})}
          placeholder="e.g., ABSA BANK"
        />
      </div>
      {/* Repeat for other fields */}
    </div>
  </CardContent>
</Card>
```

### Step 3: PDF Generator Update
**File**: `src/utils/pdfGenerator.ts`

**Checklist**:
- [ ] Add bank fields to `CompanyDetails` interface (after line 62)
- [ ] Find hardcoded bank details section (~line 150-160)
- [ ] Replace hardcoded text with dynamic values:
  ```typescript
  const bankName = company?.bank_name || 'Not configured';
  const accountNumber = company?.bank_account_number || '';
  const accountName = company?.bank_account_name || '';
  // ... etc
  ```
- [ ] Update PDF generation to use dynamic values
- [ ] Test PDF with configured and unconfigured bank details

### Step 4: Statement Preview Modal
**File**: `src/components/statements/CustomerStatementPreviewModal.tsx`

**Checklist**:
- [ ] Import `Card`, `CardContent`, `CardHeader`, `CardTitle` from UI components
- [ ] Add bank details display section after Outstanding Invoices table
- [ ] Show bank details only if configured:
  ```typescript
  {company?.bank_name && (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm">Bank Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* 2-column grid layout */}
      </CardContent>
    </Card>
  )}
  ```
- [ ] Include: Bank Name, Account Name, Account Number, SWIFT, Branch Code, Paybill
- [ ] Test visibility with and without bank details

---

## Feature 2: Clear Overdue vs Current Distinction

### Step 1: Extract Aging Logic
**File**: `src/utils/agingCalculations.ts` (NEW)

**Checklist**:
- [ ] Create new utility file
- [ ] Copy aging calculation logic from CustomerStatementPreviewModal
- [ ] Export function:
  ```typescript
  export function calculateAgingBuckets(invoices: Invoice[], today: Date) {
    return {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0
    };
  }
  ```
- [ ] Ensure logic matches SQL aging queries

### Step 2: Enhance CustomerStatementPreviewModal
**File**: `src/components/statements/CustomerStatementPreviewModal.tsx`

**Checklist**:
- [ ] Import `useInvoicesFixed` and payment data ✓
- [ ] Calculate aging buckets ✓
- [ ] Add Aging Summary Card at TOP of modal:
  - [ ] Show Current amount (green)
  - [ ] Show Total Overdue amount (red)
  - [ ] Show Total Outstanding
  - [ ] Show breakdown: 1-30, 31-60, 61-90, 90+
  
  ```typescript
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="text-sm">Aging Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">Current</p>
          <p className="text-lg font-bold text-green-600">{aging.current.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-lg font-bold text-red-600">{(aging.days30 + aging.days60 + aging.days90 + aging.over90).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold">{customer.total_outstanding.toFixed(2)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
  ```

- [ ] Outstanding Invoices table - add Status column:
  - [ ] Use `getStatusBadge()` function (already exists, line 79-87)
  - [ ] Show green "Current" or red "Overdue" badge
  
  ```typescript
  <TableCell>
    {getStatusBadge(
      Math.floor((today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)),
      inv.total_amount - (inv.paid_amount || 0)
    )}
  </TableCell>
  ```

- [ ] Optional: Add filter buttons for "All | Current | Overdue"
- [ ] Optional: Add sort by Due Date / Status

### Step 3: Verify PDF Aging Consistency
**File**: `src/utils/pdfGenerator.ts`

**Checklist**:
- [ ] Find aging calculation in PDF generation
- [ ] Ensure it uses same logic as CustomerStatementPreviewModal
- [ ] Extract to shared utility if needed
- [ ] Test: PDF aging matches preview aging

### Step 4: Testing
**Checklist**:
- [ ] Create test invoices:
  - [ ] Due today → should show "Current"
  - [ ] Due yesterday → should show "Overdue"
  - [ ] Partial payment → should show remaining balance
  - [ ] Fully paid → should not appear in outstanding
  - [ ] Due 35 days ago → should be in 31-60 bucket
  - [ ] Due 100 days ago → should be in 90+ bucket
- [ ] Verify aging totals = current + all overdue buckets
- [ ] Test with no outstanding invoices
- [ ] Test with all invoices overdue

---

## Feature 3: Excel Aging Analysis

### Step 1: Identify Export Functions
**File**: `src/utils/csvExporter.ts`

**Current Status**:
- `exportCustomerStatementsToExcel()` - Line 73 ✓ EXISTS
- `exportDataToExcelWithAgingSummary()` - Line 104 ✓ EXISTS
- `exportDataToExcel()` - Line 225 ✓ EXISTS

**Checklist**:
- [x] Functions already exist
- [ ] Verify they're being used correctly
- [ ] Check `exportCustomerStatementDetailToExcel()` implementation

### Step 2: Enhance Individual Statement Export
**File**: `src/utils/csvExporter.ts`

**Checklist**:
- [ ] Find `exportCustomerStatementDetailToExcel()` function
- [ ] Add aging bucket breakdown to HTML table:
  
  ```typescript
  // Before invoice table, add:
  <tr>
    <td colspan="7" style="font-weight: bold; padding: 10pt; background: #f5f5f5;">
      AGING ANALYSIS
    </td>
  </tr>
  <tr style="background: #e8f5e9;">
    <td style="border: 1pt solid #ccc; padding: 5pt;"><b>Aging Bucket</b></td>
    <td style="border: 1pt solid #ccc; padding: 5pt; text-align: right;"><b>Amount</b></td>
    <td style="border: 1pt solid #ccc; padding: 5pt;"><b>Invoice Count</b></td>
  </tr>
  <!-- Current -->
  <tr>
    <td style="border: 1pt solid #ccc; padding: 5pt;">Current</td>
    <td style="border: 1pt solid #ccc; padding: 5pt; text-align: right; color: green;">${current.toFixed(2)}</td>
    <td style="border: 1pt solid #ccc; padding: 5pt;">${currentCount}</td>
  </tr>
  <!-- 1-30 days -->
  <tr>
    <td style="border: 1pt solid #ccc; padding: 5pt;">1-30 Days Overdue</td>
    <td style="border: 1pt solid #ccc; padding: 5pt; text-align: right;">${days30.toFixed(2)}</td>
    <td style="border: 1pt solid #ccc; padding: 5pt;">${days30Count}</td>
  </tr>
  <!-- Repeat for 31-60, 61-90, 90+ -->
  ```

- [ ] Verify currency formatting
- [ ] Verify totals match preview modal
- [ ] Test with multiple customers

### Step 3: Enhance Summary Export
**File**: `src/utils/csvExporter.ts`

**Checklist**:
- [ ] Check if `exportCustomerStatementSummaryToExcel()` needs creation
- [ ] If exists, verify it includes aging breakdown
- [ ] If not, create function with:
  - [ ] Company header info
  - [ ] Aging totals (Current, Overdue by bucket)
  - [ ] Per-customer summary table
  
  ```typescript
  export const exportCustomerStatementSummaryToExcel = (
    statements: CustomerStatementData[],
    options?: ExcelExportOptions
  ) => {
    // Build table with columns:
    // Customer | Email | Current | 1-30 | 31-60 | 61-90 | 90+ | Total Outstanding
    
    // Calculate totals for each bucket
    // Generate HTML with aging summary at top
  };
  ```

### Step 4: Testing
**Checklist**:
- [ ] Export single customer statement:
  - [ ] Verify aging breakdown shows
  - [ ] Verify amounts match preview
  - [ ] Verify invoice count is correct
  - [ ] Verify totals sum correctly
  
- [ ] Export all customers summary:
  - [ ] Verify company header appears
  - [ ] Verify per-customer breakdown
  - [ ] Verify totals are accurate
  - [ ] Verify currency formatting

- [ ] Edge cases:
  - [ ] Customer with no outstanding invoices
  - [ ] Customer with all current invoices
  - [ ] Customer with all overdue invoices
  - [ ] Verify Excel opens without errors

---

## Complete Testing Matrix

### Bank Details
| Scenario | Expected | Status |
|----------|----------|--------|
| Create company without bank details | No bank section in statement | |
| Add bank details | Bank section appears with all fields | |
| Remove one field | Remaining fields still show | |
| PDF with bank details | Bank details appear below totals | |
| Excel with bank details | Bank details in header or section | |

### Overdue Distinction
| Scenario | Expected | Status |
|----------|----------|--------|
| Invoice due yesterday | Shows "Overdue" badge, red | |
| Invoice due today | Shows "Current" badge, green | |
| Invoice due tomorrow | Shows "Current" badge, green | |
| 25 days overdue | In 1-30 bucket | |
| 35 days overdue | In 31-60 bucket | |
| 100 days overdue | In 90+ bucket | |
| Paid invoice | "Paid" badge, not in outstanding | |
| Partial payment | Shows remaining balance | |

### Excel Aging
| Scenario | Expected | Status |
|----------|----------|--------|
| Single customer export | Aging breakdown shows | |
| All customers export | Per-customer aging visible | |
| Zero outstanding customer | Not in report or shows 0 | |
| All current invoices | Only Current bucket populated | |
| All overdue invoices | Only overdue buckets populated | |
| Mixed aging | All buckets have values | |
| Excel opens correctly | No formatting errors | |

---

## Deployment Checklist

### Pre-Deployment
- [ ] All code changes complete
- [ ] All tests passing
- [ ] Code review completed
- [ ] No console errors
- [ ] Performance verified (aging queries)

### Deployment
- [ ] Run Supabase migration: `20250305000000_add_bank_details_columns.sql`
- [ ] Verify migration succeeded (check companies table in Supabase)
- [ ] Deploy code changes
- [ ] Verify in staging environment

### Post-Deployment
- [ ] Test with production data sample
- [ ] Verify bank details load from database
- [ ] Test PDF generation
- [ ] Test Excel export
- [ ] Monitor for errors in logs
- [ ] Get user acceptance feedback

---

## Quick Links
- **Detailed Plan**: See `INVOICING_ENHANCEMENT_PLAN.md`
- **SQL Queries**: See `SQL_REFERENCE_INVOICING_ENHANCEMENTS.sql`
- **Migration**: See `supabase/migrations/20250305000000_add_bank_details_columns.sql`

---

## Common Issues & Solutions

### Issue: Bank details not showing in preview
**Solution**: 
1. Verify bank details saved in database
2. Check company data is being loaded
3. Ensure `company` prop is passed to modal

### Issue: Aging amounts don't match
**Solution**:
1. Verify aging logic matches between files
2. Check invoice status filtering (skip 'cancelled')
3. Ensure payment amounts are summed correctly
4. Check timezone handling (use UTC)

### Issue: Excel export formatting broken
**Solution**:
1. Verify HTML table structure is valid
2. Check colspan values match column count
3. Test in Excel and Google Sheets
4. Verify no special characters breaking HTML

### Issue: Performance slow on aging queries
**Solution**:
1. Add indexes (see SQL_REFERENCE)
2. Limit query scope (company_id, date range)
3. Cache aging calculations
4. Consider database views for complex queries

---

## Success Metrics

✓ Bank Details:
- Users can edit bank details in settings
- Bank details appear in PDF, HTML, and Excel
- Fallback works for unconfigured banks

✓ Overdue Distinction:
- Current/Overdue badges display correctly
- Aging summary shows all buckets
- Sorting/filtering works (if implemented)

✓ Excel Aging:
- Aging breakdown included in exports
- All buckets visible and accurate
- Totals verified against preview

✓ Overall:
- All features integrated without regressions
- Performance acceptable
- No breaking changes
- User feedback positive
