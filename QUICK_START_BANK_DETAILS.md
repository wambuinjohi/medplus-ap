# Quick Start: Bank Details Feature
## 30-Minute Implementation Guide

This is the **fastest path** to implementing bank details. Do this first.

---

## Step 1: Run Database Migration (2 min)

### In Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20250305000000_add_bank_details_columns.sql`
3. Paste and run

**Verify**:
```sql
SELECT bank_name, bank_account_number FROM companies LIMIT 1;
```
Should return columns without errors.

---

## Step 2: Add Bank Form to Settings (15 min)

### File: `src/pages/settings/CompanySettings.tsx`

**Find**: Line 300-400 (where other form sections are)

**Add this after address section**:

```typescript
{/* Bank Details Section */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      Bank Details
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Bank Name</Label>
        <Input
          value={companyData.bank_name}
          onChange={(e) => setCompanyData({...companyData, bank_name: e.target.value})}
          placeholder="e.g., ABSA BANK"
        />
      </div>
      <div>
        <Label>Account Name</Label>
        <Input
          value={companyData.bank_account_name}
          onChange={(e) => setCompanyData({...companyData, bank_account_name: e.target.value})}
          placeholder="e.g., MEDPLUS AFRICA LIMITED"
        />
      </div>
      <div>
        <Label>Account Number</Label>
        <Input
          value={companyData.bank_account_number}
          onChange={(e) => setCompanyData({...companyData, bank_account_number: e.target.value})}
          placeholder="e.g., 2047138798"
        />
      </div>
      <div>
        <Label>SWIFT Code</Label>
        <Input
          value={companyData.swift_code}
          onChange={(e) => setCompanyData({...companyData, swift_code: e.target.value})}
          placeholder="Optional"
        />
      </div>
      <div>
        <Label>Branch Code</Label>
        <Input
          value={companyData.branch_code}
          onChange={(e) => setCompanyData({...companyData, branch_code: e.target.value})}
          placeholder="Optional"
        />
      </div>
      <div>
        <Label>M-Pesa Paybill</Label>
        <Input
          value={companyData.paybill_number}
          onChange={(e) => setCompanyData({...companyData, paybill_number: e.target.value})}
          placeholder="Optional"
        />
      </div>
    </div>
  </CardContent>
</Card>
```

**Already done**:
- [x] State initialization (lines 45-50)
- [x] State update on company load (lines 101-106)
- [x] Update logic via `updateCompany` hook

---

## Step 3: Update PDF Generator (10 min)

### File: `src/utils/pdfGenerator.ts`

**Find**: `interface CompanyDetails` (around line 49)

**Add fields**:
```typescript
export interface CompanyDetails {
  // ... existing fields ...
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  swift_code?: string;
  branch_code?: string;
  paybill_number?: string;
}
```

**Find**: Where bank details are used in PDF generation (search for "ABSA")

**Replace hardcoded with**:
```typescript
const bankDetails = `
Account Name: ${company?.bank_account_name || 'Not configured'}
Bank: ${company?.bank_name || 'Not configured'}
Account No: ${company?.bank_account_number || 'N/A'}
${company?.swift_code ? `SWIFT Code: ${company.swift_code}` : ''}
${company?.branch_code ? `Branch Code: ${company.branch_code}` : ''}
${company?.paybill_number ? `M-Pesa Paybill: ${company.paybill_number}` : ''}
`;
```

---

## Step 4: Add Bank Display to Statement Modal (10 min)

### File: `src/components/statements/CustomerStatementPreviewModal.tsx`

**Find**: End of the Outstanding Invoices table

**Add after table**:

```typescript
{/* Bank Details Section */}
{companies?.[0]?.bank_name && (
  <Card className="mt-6 border-l-4 border-l-blue-500">
    <CardHeader>
      <CardTitle className="text-sm">Bank Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Bank Name</p>
          <p className="font-semibold">{companies[0].bank_name}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Account Name</p>
          <p className="font-semibold">{companies[0].bank_account_name || '-'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Account Number</p>
          <p className="font-semibold">{companies[0].bank_account_number || '-'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">SWIFT Code</p>
          <p className="font-semibold">{companies[0].swift_code || '-'}</p>
        </div>
        {companies[0].branch_code && (
          <div>
            <p className="text-gray-500 text-xs">Branch Code</p>
            <p className="font-semibold">{companies[0].branch_code}</p>
          </div>
        )}
        {companies[0].paybill_number && (
          <div>
            <p className="text-gray-500 text-xs">M-Pesa Paybill</p>
            <p className="font-semibold">{companies[0].paybill_number}</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)}
```

---

## Step 5: Test (3 min)

### In the app:
1. Go to Settings > Company Settings
2. Scroll to Bank Details section
3. Enter bank information:
   - Bank Name: "ABSA BANK"
   - Account Name: "MEDPLUS AFRICA LIMITED"
   - Account Number: "2047138798"
4. Click Save
5. Go to a customer statement
6. Click "View Statement"
7. Scroll down - you should see bank details displayed

### In PDF:
1. In statement modal, click "Download PDF"
2. Open PDF, scroll to end
3. Should see bank details below invoice total

---

## Complete! ✓

You've successfully implemented the bank details feature in **~30 minutes**.

### Next Steps (Optional):
1. Try Feature 2: Overdue distinction (see `IMPLEMENTATION_CHECKLIST.md`)
2. Try Feature 3: Excel aging (see `IMPLEMENTATION_CHECKLIST.md`)

### Troubleshooting

**Bank details not showing?**
- Check browser console for errors
- Verify company data loaded: `console.log(companies)`
- Verify database migration ran successfully

**Save button not working?**
- Check React DevTools for state updates
- Verify `updateCompany` hook is working
- Check network tab for failed requests

**PDF not showing bank details?**
- Verify company object passed to PDF function
- Check PDF generation logic updated
- Ensure PDF refresh (hard reload)

---

### Files Modified Summary
- ✓ Database: Migration run
- ✓ Settings: Bank form added
- ✓ PDF: Updated to use dynamic data
- ✓ Statement Modal: Bank details displayed

**Total Lines Added**: ~80 lines of code
**Time to Complete**: 30 minutes
**Complexity**: Low
**Risk**: Minimal (backward compatible)

---

Done! Your invoicing system now has editable, visible bank details. 🎉
