/**
 * Terms Verification Utility
 * Tests that all PDF generation functions use dynamic terms
 */

import { getTermsAndConditions, setTermsAndConditions, resetTermsToDefault } from './termsManager';

export interface PDFFunctionTestResult {
  functionName: string;
  tested: boolean;
  success: boolean;
  message: string;
  termsUsed?: string;
}

/**
 * Set a test terms value for verification
 */
export const setTestTerms = (customTerms: string): void => {
  setTermsAndConditions(customTerms);
};

/**
 * Get test terms to verify they're being used
 */
export const getTestTerms = (): string => {
  return getTermsAndConditions();
};

/**
 * Reset to default terms after testing
 */
export const resetToDefaultAfterTest = (): void => {
  resetTermsToDefault();
};

/**
 * Verification checklist for all PDF generation functions
 * These are the 8 PDF functions that should use dynamic terms:
 */
export const PDF_FUNCTIONS_TO_TEST = [
  {
    name: 'generatePDF',
    type: 'Core Function',
    usage: 'Used by all other PDF generators',
    testFile: 'src/utils/pdfGenerator.ts:120',
    verifyBy: 'Check that dynamicTerms is retrieved from getFormattedTermsForPDF()'
  },
  {
    name: 'generatePaymentReceiptPDF',
    type: 'Payment Receipt',
    usage: 'Generate payment receipt PDFs',
    testFile: 'src/utils/pdfGenerator.ts:965',
    verifyBy: 'Create a test payment and download receipt PDF'
  },
  {
    name: 'downloadInvoicePDF',
    type: 'Invoice/Proforma',
    usage: 'Generate invoice and proforma invoice PDFs',
    testFile: 'src/utils/pdfGenerator.ts:1001',
    verifyBy: 'Create a test invoice and download PDF'
  },
  {
    name: 'downloadQuotationPDF',
    type: 'Quotation',
    usage: 'Generate quotation PDFs',
    testFile: 'src/utils/pdfGenerator.ts:1051',
    verifyBy: 'Create a test quotation and download PDF'
  },
  {
    name: 'generateCustomerStatementPDF',
    type: 'Statement',
    usage: 'Generate customer statement PDFs',
    testFile: 'src/utils/pdfGenerator.ts:1097',
    verifyBy: 'Generate a customer statement report'
  },
  {
    name: 'downloadRemittancePDF',
    type: 'Remittance',
    usage: 'Generate remittance advice PDFs',
    testFile: 'src/utils/pdfGenerator.ts:1220',
    verifyBy: 'Create a remittance advice and download PDF'
  },
  {
    name: 'downloadDeliveryNotePDF',
    type: 'Delivery Note',
    usage: 'Generate delivery note PDFs',
    testFile: 'src/utils/pdfGenerator.ts:1261',
    verifyBy: 'Create a delivery note and download PDF'
  },
  {
    name: 'downloadLPOPDF',
    type: 'Local Purchase Order',
    usage: 'Generate LPO PDFs',
    testFile: 'src/utils/pdfGenerator.ts:1310',
    verifyBy: 'Create an LPO and download PDF'
  },
];

/**
 * Manual verification steps
 */
export const VERIFICATION_STEPS = `
# Verification Steps for Dynamic Terms in PDFs

## 1. Test Setup
- Go to Settings → Terms & Conditions
- Change the default terms to something distinctive like:
  "VERIFICATION TEST - Custom Terms v1.0"
- Click Save

## 2. Test Each Document Type

### 2.1 Quotations
- Create a new quotation
- Download the quotation PDF
- Verify the PDF contains "VERIFICATION TEST - Custom Terms v1.0"
- Status: ✓ Pass if test terms appear, ✗ Fail if old terms appear

### 2.2 Invoices
- Create a new invoice
- Download the invoice PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

### 2.3 Proforma Invoices
- Create a new proforma invoice
- Download the proforma PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

### 2.4 Delivery Notes
- Create a new delivery note
- Download the delivery note PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

### 2.5 LPOs (Local Purchase Orders)
- Create a new LPO
- Download the LPO PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

### 2.6 Remittance Advice
- Create a remittance advice
- Download the remittance PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

### 2.7 Customer Statements
- Go to Reports → Customer Statements
- Generate a statement for a customer
- Download the statement PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

### 2.8 Payment Receipts
- Record a payment in the system
- Download the payment receipt PDF
- Verify the PDF contains the custom test terms
- Status: ✓ Pass/✗ Fail

## 3. Verification of Implementation

### Code Check
All 8 PDF generation functions should:
1. Call generatePDF() as the core function
2. generatePDF() should call getFormattedTermsForPDF()
3. getFormattedTermsForPDF() retrieves terms from localStorage

### Document-Specific Terms Override
Test that document-specific terms (if set) override the default:
- Create an invoice with custom terms field
- Set it to something different from default
- Download the invoice
- Verify the PDF shows the invoice-specific terms, not the default

## 4. Reset
After testing:
- Go to Settings → Terms & Conditions
- Click "Reset to Default"
- Verify it shows the original terms

## Expected Results
✓ All 8 document types should use the dynamic terms
✓ Changes made in Settings should be immediately reflected in new PDFs
✓ Document-specific terms should override default terms
✓ Reset should restore original default terms
`;

/**
 * Generate a test report
 */
export const generateTestReport = (results: PDFFunctionTestResult[]): string => {
  const passCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const passPercentage = Math.round((passCount / totalCount) * 100);

  let report = `
# Dynamic Terms Verification Report

## Summary
- Total Tests: ${totalCount}
- Passed: ${passCount}
- Failed: ${totalCount - passCount}
- Success Rate: ${passPercentage}%

## Test Results
`;

  results.forEach(result => {
    report += `
### ${result.functionName}
- Status: ${result.success ? '✓ PASS' : '✗ FAIL'}
- Message: ${result.message}
${result.termsUsed ? `- Terms Used: "${result.termsUsed.substring(0, 100)}..."` : ''}
`;
  });

  report += `

## Conclusion
${passPercentage === 100 ? '✓ All PDFs are successfully using dynamic terms!' : '✗ Some PDFs are not using dynamic terms. Please review the failures above.'}
`;

  return report;
};

/**
 * Log all PDF functions that need testing
 */
export const logVerificationChecklist = (): void => {
  console.log('=== PDF Dynamic Terms Verification Checklist ===\n');
  PDF_FUNCTIONS_TO_TEST.forEach((func, index) => {
    console.log(`${index + 1}. ${func.name}`);
    console.log(`   Type: ${func.type}`);
    console.log(`   Usage: ${func.usage}`);
    console.log(`   File: ${func.testFile}`);
    console.log(`   Test: ${func.verifyBy}\n`);
  });
};
