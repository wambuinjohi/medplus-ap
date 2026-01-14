import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_TERMS } from '@/utils/termsManager';

/**
 * Fetch company terms from database with fallback to default
 * Use this when generating PDFs to ensure latest terms are applied
 */
export const fetchCompanyTermsForPDF = async (companyId: string): Promise<string> => {
  try {
    if (!companyId) {
      return DEFAULT_TERMS;
    }

    const { data, error } = await supabase
      .from('company_settings')
      .select('terms_and_conditions')
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.warn('Error fetching company terms for PDF:', error);
      return DEFAULT_TERMS;
    }

    return data?.terms_and_conditions || DEFAULT_TERMS;
  } catch (error) {
    console.error('Unexpected error fetching company terms for PDF:', error);
    return DEFAULT_TERMS;
  }
};

/**
 * Format terms for PDF display with proper structure
 * Preserves line breaks and numbering
 */
export const formatTermsForPDFDisplay = (termsText: string): string => {
  // Escape HTML special characters
  const escaped = termsText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Preserve formatting with proper CSS
  return `
    <div style="text-align:left; font-size:11px; color:#333; line-height:1.5; font-family: Arial, sans-serif;">
      <strong>Terms & Conditions</strong>
      <div style="margin-top: 8px; white-space: pre-wrap; word-wrap: break-word;">
        ${escaped}
      </div>
    </div>
  `;
};

/**
 * Get formatted terms for a specific document type
 * Call this before generating PDFs
 */
export const getFormattedTermsForDocument = async (
  companyId: string,
  documentType: 'invoice' | 'quotation' | 'proforma' | 'credit-note' | 'lpo' = 'invoice'
): Promise<string> => {
  const terms = await fetchCompanyTermsForPDF(companyId);
  
  // Add document-specific header if needed
  const headers: Record<string, string> = {
    invoice: 'Terms & Conditions',
    quotation: 'Terms & Conditions',
    proforma: 'Terms & Conditions',
    'credit-note': 'Terms & Conditions',
    lpo: 'Terms & Conditions',
  };

  const header = headers[documentType] || 'Terms & Conditions';
  
  return `<strong>${header}</strong><br /><br />${formatTermsForPDFDisplay(terms)}`;
};

/**
 * HTML-safe version for inserting into PDFs
 */
export const getTermsAsHTML = async (companyId: string): Promise<string> => {
  const terms = await fetchCompanyTermsForPDF(companyId);
  return formatTermsForPDFDisplay(terms);
};

/**
 * Plain text version for terminal/text-based PDFs
 */
export const getTermsAsPlainText = async (companyId: string): Promise<string> => {
  return await fetchCompanyTermsForPDF(companyId);
};
