import { useCallback } from 'react';
import { fetchCompanyTermsDirectly } from './useCompanyTerms';
import { formatTermsForPDFDisplay } from '@/utils/dynamicTermsPDF';

interface PDFGenerationOptions {
  companyId: string;
  documentType?: 'invoice' | 'quotation' | 'proforma' | 'credit-note' | 'lpo';
  includeHeader?: boolean;
}

/**
 * Hook for generating PDF content with dynamic company terms
 * Use this when you need to generate PDFs with the latest company terms
 */
export const useDynamicTermsPDF = () => {
  /**
   * Get formatted terms for PDF inclusion
   */
  const getFormattedTerms = useCallback(
    async (options: PDFGenerationOptions): Promise<string> => {
      try {
        const terms = await fetchCompanyTermsDirectly(options.companyId);
        const formatted = formatTermsForPDFDisplay(terms);

        if (options.includeHeader !== false) {
          const header = 'Terms &amp; Conditions';
          return `<strong>${header}</strong><br />${formatted}`;
        }

        return formatted;
      } catch (error) {
        console.error('Error formatting terms for PDF:', error);
        return '<p>Terms & Conditions not available</p>';
      }
    },
    []
  );

  /**
   * Get plain text terms for PDF
   */
  const getPlainTextTerms = useCallback(
    async (companyId: string): Promise<string> => {
      try {
        return await fetchCompanyTermsDirectly(companyId);
      } catch (error) {
        console.error('Error fetching terms for PDF:', error);
        return '';
      }
    },
    []
  );

  /**
   * Prepare document data with terms injected
   */
  const injectTermsIntoDocument = useCallback(
    async (
      documentData: Record<string, any>,
      companyId: string
    ): Promise<Record<string, any>> => {
      try {
        const terms = await fetchCompanyTermsDirectly(companyId);
        return {
          ...documentData,
          terms_and_conditions: terms,
        };
      } catch (error) {
        console.error('Error injecting terms into document:', error);
        return documentData;
      }
    },
    []
  );

  return {
    getFormattedTerms,
    getPlainTextTerms,
    injectTermsIntoDocument,
  };
};
