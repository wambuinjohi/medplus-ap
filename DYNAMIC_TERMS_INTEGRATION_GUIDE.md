# Dynamic Terms & Conditions Integration Guide

## Overview
This guide shows how to integrate dynamic company terms into PDF generation across your application.

## New Files Created

1. **src/pages/settings/TermsAndConditionsSettings.tsx**
   - UI for editing company terms and conditions
   - Saves to `company_settings` table in database
   - Shows real-time preview

2. **src/hooks/useCompanyTerms.ts**
   - Hook to fetch company terms from database
   - Automatic caching and fallback support
   - Update mutation for saving changes

3. **src/hooks/useDynamicTermsPDF.ts**
   - Hook for PDF generation with dynamic terms
   - Formatting helpers for different PDF types
   - Document injection utilities

4. **src/utils/dynamicTermsPDF.ts**
   - Low-level utilities for term fetching and formatting
   - HTML and plain text formatters
   - PDF-specific helpers

5. **src/utils/applyDynamicTermsToPDF.ts**
   - Easy-to-use utilities for applying terms to documents
   - Multi-document support
   - Term verification and update functions

## Implementation Steps

### Step 1: Add Settings Page Route
Add this to your main route configuration:

```typescript
// In your router setup
import { TermsAndConditionsSettings } from '@/pages/settings/TermsAndConditionsSettings';

// Add route:
{
  path: '/app/settings/terms',
  element: <TermsAndConditionsSettings />
}
```

### Step 2: Update PDF Generation in Modals

#### For Quotation PDFs:
```typescript
import { applyDynamicTermsToDocument } from '@/utils/applyDynamicTermsToPDF';
import { generateQuotationPDF } from '@/utils/pdfGenerator'; // your PDF generator

const handleDownloadQuotationPDF = async () => {
  try {
    // Apply dynamic terms before generating PDF
    const quotationWithTerms = await applyDynamicTermsToDocument(
      quotation,
      quotation.company_id
    );
    
    // Generate PDF with updated terms
    const pdfContent = generateQuotationPDF(quotationWithTerms);
    
    // Download or display PDF...
    downloadPDF(pdfContent, `quotation-${quotation.quotation_number}.pdf`);
    toast.success('PDF generated successfully!');
  } catch (error) {
    toast.error('Error generating PDF');
    console.error(error);
  }
};
```

#### For Invoice PDFs:
```typescript
import { applyDynamicTermsToDocument } from '@/utils/applyDynamicTermsToPDF';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

const handleDownloadInvoicePDF = async () => {
  try {
    const invoiceWithTerms = await applyDynamicTermsToDocument(
      invoice,
      invoice.company_id
    );
    
    const pdfContent = generateInvoicePDF(invoiceWithTerms);
    downloadPDF(pdfContent, `invoice-${invoice.invoice_number}.pdf`);
    toast.success('PDF generated successfully!');
  } catch (error) {
    toast.error('Error generating PDF');
  }
};
```

#### For Proforma PDFs:
```typescript
import { applyDynamicTermsToDocument } from '@/utils/applyDynamicTermsToPDF';
import { generateProformaPDF } from '@/utils/pdfGenerator';

const handleDownloadProformaPDF = async () => {
  try {
    const proformaWithTerms = await applyDynamicTermsToDocument(
      proforma,
      proforma.company_id
    );
    
    const pdfContent = generateProformaPDF(proformaWithTerms);
    downloadPDF(pdfContent, `proforma-${proforma.proforma_number}.pdf`);
    toast.success('PDF generated successfully!');
  } catch (error) {
    toast.error('Error generating PDF');
  }
};
```

#### For Credit Note PDFs:
```typescript
import { applyDynamicTermsToDocument } from '@/utils/applyDynamicTermsToPDF';
import { generateCreditNotePDF } from '@/utils/creditNotePdfGenerator';

const handleDownloadCreditNotePDF = async () => {
  try {
    const creditNoteWithTerms = await applyDynamicTermsToDocument(
      creditNote,
      creditNote.company_id
    );
    
    const pdfContent = generateCreditNotePDF(creditNoteWithTerms);
    downloadPDF(pdfContent, `credit-note-${creditNote.credit_note_number}.pdf`);
    toast.success('PDF generated successfully!');
  } catch (error) {
    toast.error('Error generating PDF');
  }
};
```

#### For LPO PDFs:
```typescript
import { applyDynamicTermsToDocument } from '@/utils/applyDynamicTermsToPDF';
import { generateLPOPDF } from '@/utils/lpoPdfGenerator';

const handleDownloadLPOPDF = async () => {
  try {
    const lpoWithTerms = await applyDynamicTermsToDocument(
      lpo,
      lpo.company_id
    );
    
    const pdfContent = generateLPOPDF(lpoWithTerms);
    downloadPDF(pdfContent, `lpo-${lpo.lpo_number}.pdf`);
    toast.success('PDF generated successfully!');
  } catch (error) {
    toast.error('Error generating PDF');
  }
};
```

### Step 3: Update Modals with PDF Download Feature

Example for ViewQuotationModal:

```typescript
import { applyDynamicTermsToDocument } from '@/utils/applyDynamicTermsToPDF';

export function ViewQuotationModal({ quotation, onClose }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Apply dynamic terms
      const quotationWithTerms = await applyDynamicTermsToDocument(
        quotation,
        quotation.company_id
      );
      
      // Generate and download PDF
      const pdf = generateQuotationPDF(quotationWithTerms);
      // ... download logic
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Error generating PDF');
      console.error(error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog>
      {/* ... */}
      <Button 
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
      >
        {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
      </Button>
    </Dialog>
  );
}
```

### Step 4: Using the Hook in Components

```typescript
import { useDynamicTermsPDF } from '@/hooks/useDynamicTermsPDF';

export function MyComponent({ document, companyId }) {
  const { getFormattedTerms, injectTermsIntoDocument } = useDynamicTermsPDF();

  const handleGeneratePDF = async () => {
    // Method 1: Just get the formatted terms
    const termsHTML = await getFormattedTerms({
      companyId,
      documentType: 'quotation',
      includeHeader: true,
    });
    // Use termsHTML in PDF generation...

    // Method 2: Inject terms into document
    const documentWithTerms = await injectTermsIntoDocument(document, companyId);
    // Generate PDF with documentWithTerms...
  };

  return <Button onClick={handleGeneratePDF}>Generate PDF</Button>;
}
```

## Database Schema

The system uses the `company_settings` table:

```sql
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  terms_and_conditions TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
```

## Fallback Behavior

If terms are not found in the database:
1. Check localStorage for cached terms
2. Fall back to DEFAULT_TERMS (8 items) from termsManager

## Best Practices

1. **Always apply dynamic terms before PDF generation:**
   ```typescript
   // ✅ Good - Always get fresh terms from database
   const docWithTerms = await applyDynamicTermsToDocument(doc, companyId);
   
   // ❌ Bad - Using stale terms from document state
   const pdf = generatePDF(stateDocument);
   ```

2. **Use the settings page to manage terms:**
   - Visit `/app/settings/terms`
   - Edit terms there
   - Changes apply to all new documents

3. **Existing documents keep their original terms:**
   - Only new PDFs use the latest terms
   - Historical accuracy is preserved

4. **Error handling:**
   ```typescript
   try {
     const docWithTerms = await applyDynamicTermsToDocument(doc, companyId);
     generatePDF(docWithTerms);
   } catch (error) {
     toast.error('Error applying terms');
     // PDF generator will use document's existing terms as fallback
   }
   ```

## Testing

Test PDF generation with dynamic terms:

1. Go to `/app/settings/terms`
2. Edit the terms and save
3. Create a new document (quotation, invoice, etc.)
4. Download PDF
5. Verify new PDF shows updated terms
6. Old documents still show original terms

## Files Modified

- Modal components: ViewQuotationModal, ViewInvoiceModal, etc.
- PDF generators: Should be updated with dynamic term logic
- Settings page: New TermsAndConditionsSettings page

## Support

All utilities have built-in error handling and fallback to default terms if anything goes wrong.

For issues, check the browser console for error messages with the prefix "Error" or "Error applying dynamic terms".
