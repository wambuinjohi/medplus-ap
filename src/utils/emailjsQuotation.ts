import emailjs from 'emailjs-com';

export interface QuotationEmailDetails {
  productName: string;
  productSku?: string;
  category?: string;
  quantity: string | number;
  companyName: string;
  contactPerson?: string;
  email: string;
  phone: string;
  additionalNotes?: string;
}

// Initialize EmailJS with your public key
const PUBLIC_KEY = 'dK906nDGwBHoPvOsr';

let initialized = false;

/**
 * Initialize EmailJS (should be called once at app startup)
 */
export const initializeEmailJS = () => {
  if (!initialized) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
};

/**
 * Format quotation details into email body
 */
export const formatQuotationEmailBody = (details: QuotationEmailDetails): string => {
  const lines: string[] = [];

  lines.push('QUOTATION REQUEST');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');

  // Product Details
  lines.push('PRODUCT DETAILS:');
  lines.push(`Product: ${details.productName}`);
  if (details.productSku) {
    lines.push(`SKU: ${details.productSku}`);
  }
  if (details.category) {
    lines.push(`Category: ${details.category}`);
  }
  lines.push('');

  // Order Details
  lines.push('ORDER DETAILS:');
  lines.push(`Quantity: ${details.quantity} units`);
  lines.push('');

  // Customer Details
  lines.push('CUSTOMER INFORMATION:');
  lines.push(`Company/Institution: ${details.companyName}`);
  if (details.contactPerson) {
    lines.push(`Contact Person: ${details.contactPerson}`);
  }
  lines.push(`Email: ${details.email}`);
  lines.push(`Phone: ${details.phone}`);
  lines.push('');

  // Additional Notes
  if (details.additionalNotes) {
    lines.push('ADDITIONAL NOTES:');
    lines.push(details.additionalNotes);
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('Please provide a quotation for the above product with pricing and delivery terms.');

  return lines.join('\n');
};

/**
 * Send quotation request via email using EmailJS
 */
export const sendQuotationEmail = async (details: QuotationEmailDetails): Promise<string> => {
  initializeEmailJS();

  // Template parameters that match your EmailJS template
  const templateParams = {
    to_email: 'info@medplusafrica.com', // Your receiving email
    from_email: details.email,
    from_name: details.contactPerson || details.companyName,
    subject: `Quotation Request - ${details.productName}`,
    message: formatQuotationEmailBody(details),
    company_name: details.companyName,
    contact_person: details.contactPerson || 'N/A',
    phone: details.phone,
    product_name: details.productName,
    product_sku: details.productSku || 'N/A',
    category: details.category || 'N/A',
    quantity: details.quantity,
    additional_notes: details.additionalNotes || 'None'
  };

  try {
    const response = await emailjs.send(
      'service_1ahnuvn', // Your service ID
      'template_ulgafes', // Your template ID
      templateParams
    );

    return response.status === 200 ? 'success' : 'error';
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw new Error('Failed to send quotation email. Please try again.');
  }
};

/**
 * Send quotation email with error handling
 */
export const sendQuotationEmailSafe = async (details: QuotationEmailDetails): Promise<{ success: boolean; message: string }> => {
  try {
    await sendQuotationEmail(details);
    return {
      success: true,
      message: 'Quotation request sent successfully via email!'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send quotation email';
    return {
      success: false,
      message: errorMessage
    };
  }
};
