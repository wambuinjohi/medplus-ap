// Terms and Conditions Manager
// Handles retrieval and storage of dynamic terms across the application

const TERMS_STORAGE_KEY = 'default_terms_and_conditions';

export const DEFAULT_TERMS = `1. Payment Terms
   Payment strictly as per approved terms. Interest of 2% per month will be charged on overdue invoices.

2. Goods Return Policy
   Claims and queries must be lodged with us within 21 days of dispatch of goods, otherwise they will not be accepted back.

3. Payment Methods
   Cash transactions of any kind are not acceptable. All payments should be made by cheque, MPESA, or Bank transfer only.

4. Liability and Responsibility
   The company will not be responsible for any loss or damage of goods in transit collected by the customer or sent via customer's courier account.

5. Lien Rights
   The company shall have general as well as particular lien on all goods for any unpaid account.

6. Transportation
   Where applicable, transport will be invoiced separately.

7. Tax Policy
   The VAT is inclusive where applicable.

8. General
   E.&O.E (Errors and Omissions Excepted)`;

/**
 * Get the current terms and conditions (synchronous fallback)
 * Returns stored terms from localStorage, or DEFAULT_TERMS if not set
 * Note: For fresh terms from database, use useCompanyTerms hook instead
 */
export const getTermsAndConditions = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const storedTerms = localStorage.getItem(TERMS_STORAGE_KEY);
      return storedTerms || DEFAULT_TERMS;
    }
    return DEFAULT_TERMS;
  } catch (error) {
    console.error('Error retrieving terms:', error);
    return DEFAULT_TERMS;
  }
};

/**
 * Save terms and conditions to localStorage
 */
export const setTermsAndConditions = (terms: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TERMS_STORAGE_KEY, terms);
    }
  } catch (error) {
    console.error('Error saving terms:', error);
  }
};

/**
 * Reset terms to default
 */
export const resetTermsToDefault = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TERMS_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error resetting terms:', error);
  }
};

/**
 * Convert plain text terms to HTML format for PDF display
 * Preserves the exact content without aggressive transformation
 */
export const formatTermsForPDF = (termsText: string): string => {
  // Escape HTML special characters to prevent injection
  const escaped = termsText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Preserve line breaks and formatting by wrapping in <pre> with proper styling
  // This maintains the exact text as entered by the user
  return `
    <div style="text-align:left; font-size:11px; color:#333; line-height:1.4;">
      <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word; margin: 0; font-size: 11px; color: #333;">${escaped}</pre>
    </div>
  `;
};

/**
 * Get terms as HTML formatted for PDF display
 */
export const getFormattedTermsForPDF = (): string => {
  const terms = getTermsAndConditions();
  return formatTermsForPDF(terms);
};

export const DEFAULT_TERMS_EXPORT = DEFAULT_TERMS;
