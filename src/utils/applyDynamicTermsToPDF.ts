import { fetchCompanyTermsDirectly } from '@/hooks/useCompanyTerms';

/**
 * Apply dynamic company terms to any document before PDF generation
 * This ensures the latest terms from the database are used
 */
export const applyDynamicTermsToDocument = async <T extends Record<string, any>>(
  document: T,
  companyId: string
): Promise<T> => {
  try {
    const terms = await fetchCompanyTermsDirectly(companyId);
    return {
      ...document,
      terms_and_conditions: terms,
    };
  } catch (error) {
    console.error('Error applying dynamic terms to document:', error);
    return document;
  }
};

/**
 * Usage examples for different document types:
 * 
 * QUOTATION PDF:
 * ---------------
 * const quotationWithTerms = await applyDynamicTermsToDocument(
 *   quotation,
 *   quotation.company_id
 * );
 * const pdf = generateQuotationPDF(quotationWithTerms);
 *
 * INVOICE PDF:
 * ---------------
 * const invoiceWithTerms = await applyDynamicTermsToDocument(
 *   invoice,
 *   invoice.company_id
 * );
 * const pdf = generateInvoicePDF(invoiceWithTerms);
 *
 * PROFORMA PDF:
 * ---------------
 * const proformaWithTerms = await applyDynamicTermsToDocument(
 *   proforma,
 *   proforma.company_id
 * );
 * const pdf = generateProformaPDF(proformaWithTerms);
 *
 * In Modal Components (e.g., ViewQuotationModal):
 * ---------------
 * const handleDownloadPDF = async () => {
 *   try {
 *     const quotationWithDynamicTerms = await applyDynamicTermsToDocument(
 *       quotation,
 *       quotation.company_id
 *     );
 *     
 *     const pdfContent = generateQuotationPDF(quotationWithDynamicTerms);
 *     // Download or display PDF...
 *   } catch (error) {
 *     toast.error('Error generating PDF');
 *   }
 * };
 */

/**
 * Apply terms to multiple documents at once
 */
export const applyDynamicTermsToDocuments = async <T extends Record<string, any>>(
  documents: T[],
  companyId: string
): Promise<T[]> => {
  try {
    const terms = await fetchCompanyTermsDirectly(companyId);
    return documents.map((doc) => ({
      ...doc,
      terms_and_conditions: terms,
    }));
  } catch (error) {
    console.error('Error applying dynamic terms to documents:', error);
    return documents;
  }
};

/**
 * Get just the terms (without modifying the document)
 */
export const getDynamicTermsForPDF = async (companyId: string): Promise<string> => {
  try {
    return await fetchCompanyTermsDirectly(companyId);
  } catch (error) {
    console.error('Error fetching dynamic terms for PDF:', error);
    return '';
  }
};

/**
 * Check if document has current terms
 */
export const documentHasCurrentTerms = async (
  document: Record<string, any>,
  companyId: string
): Promise<boolean> => {
  try {
    const currentTerms = await fetchCompanyTermsDirectly(companyId);
    return document.terms_and_conditions === currentTerms;
  } catch (error) {
    console.error('Error checking document terms:', error);
    return false;
  }
};

/**
 * Update stale document terms
 */
export const updateStaleDocumentTerms = async <T extends Record<string, any>>(
  document: T,
  companyId: string
): Promise<{ document: T; updated: boolean }> => {
  try {
    const hasCurrentTerms = await documentHasCurrentTerms(document, companyId);
    
    if (!hasCurrentTerms) {
      const updatedDocument = await applyDynamicTermsToDocument(document, companyId);
      return { document: updatedDocument, updated: true };
    }
    
    return { document, updated: false };
  } catch (error) {
    console.error('Error updating stale document terms:', error);
    return { document, updated: false };
  }
};
