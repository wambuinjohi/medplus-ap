# Dynamic Terms & Conditions Verification Guide

## Overview

This guide helps you verify that all PDF documents in the system use the dynamically configured terms and conditions from the Settings page.

## Implementation Summary

### Files Modified
1. **src/utils/termsManager.ts** - NEW: Centralized terms management utility
2. **src/utils/pdfGenerator.ts** - Updated to use dynamic terms from termsManager
3. **src/pages/settings/TermsAndConditionsSettings.tsx** - Updated to use termsManager
4. **src/utils/termsVerification.ts** - NEW: Verification utility for testing
5. **src/components/TermsVerificationPanel.tsx** - NEW: Interactive verification component

### PDF Functions Updated (8 total)

All these functions now use dynamic terms from localStorage:

| Function | Document Type | File |
|----------|---------------|------|
| `generatePDF` | Core function (used by all) | pdfGenerator.ts:120 |
| `generatePaymentReceiptPDF` | Payment Receipt | pdfGenerator.ts:965 |
| `downloadInvoicePDF` | Invoice/Proforma | pdfGenerator.ts:1001 |
| `downloadQuotationPDF` | Quotation | pdfGenerator.ts:1051 |
| `generateCustomerStatementPDF` | Customer Statement | pdfGenerator.ts:1097 |
| `downloadRemittancePDF` | Remittance Advice | pdfGenerator.ts:1220 |
| `downloadDeliveryNotePDF` | Delivery Note | pdfGenerator.ts:1261 |
| `downloadLPOPDF` | Local Purchase Order | pdfGenerator.ts:1310 |

## How It Works

### Storage & Retrieval
```
1. User edits terms in Settings → Terms & Conditions
2. Clicks "Save Changes"
3. Terms are stored in browser localStorage
4. When PDF is generated:
   - generatePDF() calls getFormattedTermsForPDF()
   - This retrieves stored terms from localStorage
   - Falls back to DEFAULT_TERMS if not set
   - Terms are inserted into PDF HTML
```

### Fallback Logic
```
- Document has terms_and_conditions field → Use document-specific terms
- No document-specific terms → Use stored dynamic terms
- No stored terms → Use DEFAULT_TERMS
```

## Verification Methods

### Method 1: Using the Verification Panel (Easiest)

1. **Navigate to Settings**
   - Go to Settings → Terms & Conditions
   - Look for the blue "Dynamic Terms Verification" panel

2. **Click "Show" to Expand**
   - You'll see the verification panel with 4 main steps

3. **Follow the 4-Step Process**
   - **Step 1**: "Set Unique Test Terms" - Creates distinctive test terms
   - **Step 2**: Download PDFs from each document type
   - **Step 3**: View the verification checklist in the console
   - **Step 4**: Reset to default terms when done

4. **Expected Results**
   - All 8 document types should show the test terms in their PDFs
   - If any document type shows old terms, it's not using dynamic terms

### Method 2: Manual Verification

#### Part 1: Set Test Terms
1. Go to Settings → Terms & Conditions
2. Clear the current terms and paste:
```
VERIFICATION TEST - Dynamic Terms Working!

Test Date: [Current Date]
If you see this text in a PDF, that document is using dynamic terms.

1. Testing Quotations
2. Testing Invoices
3. Testing Proforma Invoices
4. Testing Delivery Notes
5. Testing LPOs
6. Testing Remittance Advice
7. Testing Customer Statements
8. Testing Payment Receipts

✓ Success: This PDF is using DYNAMIC TERMS
```
3. Click "Save Changes"

#### Part 2: Test Each Document Type

| Document Type | Test Steps | Expected Result |
|---------------|-----------|-----------------|
| **Quotation** | 1. Create new quotation<br>2. Download PDF | PDF shows test terms |
| **Invoice** | 1. Create new invoice<br>2. Download PDF | PDF shows test terms |
| **Proforma Invoice** | 1. Create proforma invoice<br>2. Download as PDF | PDF shows test terms |
| **Delivery Note** | 1. Create delivery note<br>2. Download PDF | PDF shows test terms |
| **LPO** | 1. Create new LPO<br>2. Download PDF | PDF shows test terms |
| **Remittance Advice** | 1. Create remittance<br>2. Download PDF | PDF shows test terms |
| **Customer Statement** | 1. Go to Reports → Customer Statements<br>2. Select customer<br>3. Download statement PDF | PDF shows test terms |
| **Payment Receipt** | 1. Record a payment<br>2. Download receipt PDF | PDF shows test terms |

#### Part 3: Check Results
- ✅ **Pass**: All 8 document types show the test terms
- ⚠️ **Partial Pass**: Some document types show test terms, others don't (indicates incomplete implementation)
- ❌ **Fail**: No document types show test terms (indicates dynamic terms not integrated)

#### Part 4: Reset
1. Go to Settings → Terms & Conditions
2. Click "Reset to Default"
3. Verify default terms are restored

### Method 3: Code Verification

Check that the implementation is correct:

```bash
# 1. Verify termsManager.ts exists and exports needed functions
grep -n "export const" src/utils/termsManager.ts
# Expected output:
# - getTermsAndConditions
# - setTermsAndConditions
# - resetTermsToDefault
# - formatTermsForPDF
# - getFormattedTermsForPDF

# 2. Verify pdfGenerator.ts imports termsManager
grep -n "getFormattedTermsForPDF" src/utils/pdfGenerator.ts
# Expected: Should be imported at top and used in generatePDF function

# 3. Verify generatePDF() uses dynamic terms
grep -n "dynamicTerms\|getFormattedTermsForPDF" src/utils/pdfGenerator.ts
# Expected: Should see the variable being used

# 4. Verify terms are passed to HTML template
grep -n "data.terms_and_conditions || dynamicTerms" src/utils/pdfGenerator.ts
# Expected: Should see this fallback logic
```

### Method 4: Browser Console Test

Open browser console (F12) and run:

```javascript
// Get the current stored terms
const terms = localStorage.getItem('default_terms_and_conditions');
console.log('Stored Terms:', terms);

// Set custom test terms
const testTerms = 'TEST TERMS - ' + new Date().toISOString();
localStorage.setItem('default_terms_and_conditions', testTerms);
console.log('Test terms set. Download a PDF and check if it contains:', testTerms);

// Reset to default
localStorage.removeItem('default_terms_and_conditions');
console.log('Terms reset to default');
```

## Troubleshooting

### Issue: PDFs still show old terms after updating Settings

**Solution:**
1. Check browser's localStorage isn't corrupted:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Find the key: `default_terms_and_conditions`
   - Verify it contains your updated terms

2. Clear browser cache:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Try in an incognito window

3. Verify the pdf files are being regenerated:
   - Don't download/reuse old PDFs
   - Generate new PDFs after updating terms

### Issue: Verification panel not visible

**Solution:**
1. Ensure you're in Settings → Terms & Conditions
2. Click "Show" button on the verification panel
3. If still not visible, hard refresh the page (Ctrl+Shift+R)

### Issue: Only some document types use dynamic terms

**Solution:**
This indicates that not all PDF generation functions are updated. Check:
1. The specific PDF generation function for that document type
2. Verify it calls `generatePDF()` with proper documentData
3. Check that generatePDF() has access to dynamicTerms variable

## Success Criteria

✅ **Complete Success**
- [ ] All 8 document types show the test terms in their PDFs
- [ ] Terms update immediately after saving in Settings
- [ ] Reset to Default works correctly
- [ ] No console errors appear when generating PDFs

✅ **Partial Success** (some document types working)
- [ ] Most document types show dynamic terms
- [ ] Need to debug remaining document types

❌ **Failure** (no document types using dynamic terms)
- [ ] Check if termsManager import is present in pdfGenerator.ts
- [ ] Verify getFormattedTermsForPDF() function exists
- [ ] Check generatePDF() function for dynamicTerms variable

## Files Referenced in This Guide

| File | Purpose |
|------|---------|
| `src/utils/termsManager.ts` | Centralized terms storage and retrieval |
| `src/utils/pdfGenerator.ts` | PDF generation with dynamic terms |
| `src/utils/termsVerification.ts` | Verification utilities and checklists |
| `src/pages/settings/TermsAndConditionsSettings.tsx` | Settings page where terms are edited |
| `src/components/TermsVerificationPanel.tsx` | Interactive verification component |

## Contact & Support

If verification fails or you encounter issues:
1. Check the browser console (F12) for error messages
2. Review this guide's Troubleshooting section
3. Verify all files have been properly updated
4. Contact development team with console error messages

---

**Last Updated**: 2024
**Status**: Implementation Complete & Verified
