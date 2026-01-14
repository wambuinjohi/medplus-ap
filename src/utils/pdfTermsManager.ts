/**
 * Comprehensive PDF Terms Manager
 * Ensures dynamic company terms and conditions are applied to all PDF types
 * This is the central hub for applying dynamic terms across the entire application
 */

import { fetchCompanyTermsDirectly } from '@/hooks/useCompanyTerms';
import { formatTermsForPDFDisplay } from './dynamicTermsPDF';

/**
 * Apply dynamic company terms to any document before PDF generation
 * This is the primary method that should be used across all PDF generation
 */
export const applyDynamicTermsToPDFDocument = async <T extends Record<string, any>>(
  document: T,
  companyId?: string
): Promise<T> => {
  // If no company ID, return document as-is (will use fallback terms)
  if (!companyId) {
    return document;
  }

  try {
    const terms = await fetchCompanyTermsDirectly(companyId);
    // Format terms with signature section for PDF display
    const formattedTerms = formatTermsForPDFDisplay(terms);
    return {
      ...document,
      terms_and_conditions: formattedTerms,
    };
  } catch (error) {
    console.error('Error applying dynamic terms to PDF document:', error);
    return document;
  }
};

/**
 * Apply terms to invoice before PDF generation
 */
export const applyTermsToInvoiceForPDF = async (
  invoice: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(invoice, companyId);
};

/**
 * Apply terms to quotation before PDF generation
 */
export const applyTermsToQuotationForPDF = async (
  quotation: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(quotation, companyId);
};

/**
 * Apply terms to proforma before PDF generation
 */
export const applyTermsToProformaForPDF = async (
  proforma: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(proforma, companyId);
};

/**
 * Apply terms to delivery note before PDF generation
 */
export const applyTermsToDeliveryNoteForPDF = async (
  deliveryNote: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(deliveryNote, companyId);
};

/**
 * Apply terms to credit note before PDF generation
 */
export const applyTermsToCreditNoteForPDF = async (
  creditNote: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(creditNote, companyId);
};

/**
 * Apply terms to LPO before PDF generation
 */
export const applyTermsToLPOForPDF = async (
  lpo: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(lpo, companyId);
};

/**
 * Apply terms to remittance advice before PDF generation
 */
export const applyTermsToRemittanceForPDF = async (
  remittance: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(remittance, companyId);
};

/**
 * Apply terms to payment receipt before PDF generation
 */
export const applyTermsToPaymentReceiptForPDF = async (
  payment: any,
  companyId?: string
): Promise<any> => {
  return applyDynamicTermsToPDFDocument(payment, companyId);
};

/**
 * Get dynamic terms for a company without modifying the document
 */
export const getDynamicTermsForCompany = async (companyId?: string): Promise<string> => {
  if (!companyId) {
    return '';
  }

  try {
    return await fetchCompanyTermsDirectly(companyId);
  } catch (error) {
    console.error('Error fetching dynamic terms for company:', error);
    return '';
  }
};

/**
 * Get formatted HTML terms for PDF display
 */
export const getFormattedTermsForPDFDisplay = async (companyId?: string): Promise<string> => {
  const terms = await getDynamicTermsForCompany(companyId);
  return formatTermsForPDFDisplay(terms);
};

/**
 * Batch apply terms to multiple documents
 */
export const applyTermsToMultipleDocuments = async <T extends Record<string, any>>(
  documents: T[],
  companyId?: string
): Promise<T[]> => {
  if (!companyId) {
    return documents;
  }

  try {
    const terms = await fetchCompanyTermsDirectly(companyId);
    // Format terms with signature section for PDF display
    const formattedTerms = formatTermsForPDFDisplay(terms);
    return documents.map((doc) => ({
      ...doc,
      terms_and_conditions: formattedTerms,
    }));
  } catch (error) {
    console.error('Error applying terms to multiple documents:', error);
    return documents;
  }
};

/**
 * Check if document has current terms from the database
 */
export const documentHasCurrentTerms = async (
  document: Record<string, any>,
  companyId?: string
): Promise<boolean> => {
  if (!companyId) {
    return false;
  }

  try {
    const currentTerms = await fetchCompanyTermsDirectly(companyId);
    return document.terms_and_conditions === currentTerms;
  } catch (error) {
    console.error('Error checking document terms:', error);
    return false;
  }
};

/**
 * Update stale terms in a document
 */
export const updateDocumentTermsIfStale = async <T extends Record<string, any>>(
  document: T,
  companyId?: string
): Promise<{ document: T; updated: boolean }> => {
  if (!companyId) {
    return { document, updated: false };
  }

  try {
    const hasCurrent = await documentHasCurrentTerms(document, companyId);

    if (!hasCurrent) {
      const updatedDocument = await applyDynamicTermsToPDFDocument(document, companyId);
      return { document: updatedDocument, updated: true };
    }

    return { document, updated: false };
  } catch (error) {
    console.error('Error updating document terms:', error);
    return { document, updated: false };
  }
};
