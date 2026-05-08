import { getAgingNarrative } from './ageCalculations';

// Helper function to build bank details HTML row
const buildBankDetailsHTML = (companyInfo: any): string => {
  if (!companyInfo) return '';

  const parts: string[] = [];
  if (companyInfo.bank_account_name) parts.push(`Account Name: ${companyInfo.bank_account_name}`);
  if (companyInfo.bank_name) parts.push(`Bank: ${companyInfo.bank_name}`);
  if (companyInfo.bank_account_number) parts.push(`Account No: ${companyInfo.bank_account_number}`);
  if (companyInfo.branch_code) parts.push(`Branch Code: ${companyInfo.branch_code}`);
  if (companyInfo.swift_code) parts.push(`Swift Code: ${companyInfo.swift_code}`);
  if (companyInfo.paybill_number) parts.push(`Paybill No: ${companyInfo.paybill_number}`);

  return parts.length > 0 ? parts.join(' • ') : '';
};

export interface CustomerStatementData {
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  total_outstanding: number;
  current_due: number;
  overdue_amount: number;
  days_overdue: number;
  last_payment_date?: string;
  last_payment_amount?: number;
  invoice_count: number;
}

export interface ExcelExportOptions {
  title?: string;
  companyInfo?: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    logo_url?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    swift_code?: string;
    branch_code?: string;
    paybill_number?: string;
  };
}

export const exportCustomerStatementsToCSV = (statements: CustomerStatementData[], filename?: string) => {
  const headers = [
    'Customer Name',
    'Email',
    'Total Outstanding',
    'Current Due',
    'Overdue Amount',
    'Days Overdue',
    'Last Payment Date',
    'Last Payment Amount',
    'Invoice Count'
  ];

  const csvData = statements.map(statement => [
    statement.customer_name,
    statement.customer_email || '',
    statement.total_outstanding.toFixed(2),
    statement.current_due.toFixed(2),
    statement.overdue_amount.toFixed(2),
    statement.days_overdue.toString(),
    statement.last_payment_date ? new Date(statement.last_payment_date).toLocaleDateString() : '',
    statement.last_payment_amount ? statement.last_payment_amount.toFixed(2) : '',
    statement.invoice_count.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `customer-statements-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Simple Excel-friendly export using HTML table and MS Excel MIME type (.xls)
export const exportCustomerStatementsToExcel = (statements: CustomerStatementData[], filename?: string, options?: ExcelExportOptions) => {
  if (!statements || statements.length === 0) return;

  const headers = [
    'Customer Name',
    'Email',
    'Total Outstanding',
    'Current Due',
    'Overdue Amount',
    'Days Overdue',
    'Last Payment Date',
    'Last Payment Amount',
    'Invoice Count'
  ];

  const rows = statements.map(s => [
    s.customer_name,
    s.customer_email || '',
    s.total_outstanding.toFixed(2),
    s.current_due.toFixed(2),
    s.overdue_amount.toFixed(2),
    s.days_overdue.toString(),
    s.last_payment_date ? new Date(s.last_payment_date).toLocaleDateString() : '',
    s.last_payment_amount ? s.last_payment_amount.toFixed(2) : '',
    s.invoice_count.toString()
  ]);

  exportDataToExcelWithAgingSummary(rows, headers, filename || `customer-statements-${new Date().toISOString().split('T')[0]}.xls`, statements, options);
};

// Excel export with aging summary
export const exportDataToExcelWithAgingSummary = (data: any[][], headers: string[], filename: string, statements: CustomerStatementData[], options?: ExcelExportOptions) => {
  if (!data || data.length === 0) return;

  const { title, companyInfo } = options || {};

  // Calculate aging totals
  const totalOutstanding = statements.reduce((sum, s) => sum + s.total_outstanding, 0);
  const totalCurrent = statements.reduce((sum, s) => sum + s.current_due, 0);
  const totalOverdue = statements.reduce((sum, s) => sum + s.overdue_amount, 0);

  // Build Company Header Rows
  let headerRows = '';
  if (companyInfo) {
    const bankDetails = buildBankDetailsHTML(companyInfo);
    headerRows = `
      <tr>
        <td colspan="${headers.length}" style="font-size: 18pt; font-weight: bold; color: #2BB673; text-align: center;">${companyInfo.name}</td>
      </tr>
      ${companyInfo.tax_number ? `<tr><td colspan="${headers.length}" style="text-align: center;"><b>PIN:</b> ${companyInfo.tax_number}</td></tr>` : ''}
      <tr>
        <td colspan="${headers.length}" style="text-align: center;">
          ${[companyInfo.address, companyInfo.city, companyInfo.country].filter(Boolean).join(', ')}
        </td>
      </tr>
      <tr>
        <td colspan="${headers.length}" style="text-align: center;">
          ${companyInfo.phone ? `<b>Tel:</b> ${companyInfo.phone} ` : ''}
          ${companyInfo.email ? `<b>Email:</b> ${companyInfo.email}` : ''}
        </td>
      </tr>
      ${bankDetails ? `<tr><td colspan="${headers.length}" style="text-align: center;"><b>Banking Details:</b> ${bankDetails}</td></tr>` : ''}
      <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    `;
  }

  // Build Title Row
  let titleRow = '';
  if (title) {
    titleRow = `
      <tr>
        <td colspan="${headers.length}" style="font-size: 14pt; font-weight: bold; color: #2DAAE1; text-align: center; border-bottom: 1pt solid #2DAAE1;">${title.toUpperCase()}</td>
      </tr>
      <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    `;
  }

  // Build Aging Summary Section
  const agingSummaryRow = `
    <tr><td colspan="${headers.length}" style="font-size: 12pt; font-weight: bold; color: #1F2937;">AGING SUMMARY</td></tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;"><b>Category</b></td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;"><b>Amount</b></td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Current</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${totalCurrent.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Overdue</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; color: #DC2626;"><b>$${totalOverdue.toFixed(2)}</b></td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; font-weight: bold;">Total Outstanding</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; font-weight: bold;">$${totalOutstanding.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    ${buildBankDetailsHTML(companyInfo) ? `
    <tr><td colspan="${headers.length}" style="font-size: 12pt; font-weight: bold; color: #1F2937;">BANKING DETAILS</td></tr>
    <tr><td colspan="${headers.length}" style="border: 0.5pt solid #cccccc; padding: 5pt;">${buildBankDetailsHTML(companyInfo)}</td></tr>
    <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    ` : ''}
    <tr><td colspan="${headers.length}" style="font-size: 12pt; font-weight: bold; color: #1F2937;">CUSTOMER DETAILS</td></tr>
    <tr><td colspan="${headers.length}">&nbsp;</td></tr>
  `;

  // Build HTML table
  const table = `
    <table>
      <thead>
        ${headerRows}
        ${titleRow}
        ${agingSummaryRow}
        <tr style="background-color: #f3f4f6; font-weight: bold; border: 0.5pt solid #cccccc;">
          ${headers.map(h => `<th style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: left;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(r => `
          <tr>
            ${r.map(cell => `<td style="border: 0.5pt solid #cccccc; padding: 5pt;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 0.5pt solid #cccccc; }
        </style>
      </head>
      <body>
        ${table}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generic Excel-friendly export using HTML table and MS Excel MIME type (.xls)
export const exportDataToExcel = (data: any[][], headers: string[], filename: string, options?: ExcelExportOptions) => {
  if (!data || data.length === 0) return;

  const { title, companyInfo } = options || {};

  // Build Company Header Rows
  let headerRows = '';
  if (companyInfo) {
    const bankDetails = buildBankDetailsHTML(companyInfo);
    headerRows = `
      <tr>
        <td colspan="${headers.length}" style="font-size: 18pt; font-weight: bold; color: #2BB673; text-align: center;">${companyInfo.name}</td>
      </tr>
      ${companyInfo.tax_number ? `<tr><td colspan="${headers.length}" style="text-align: center;"><b>PIN:</b> ${companyInfo.tax_number}</td></tr>` : ''}
      <tr>
        <td colspan="${headers.length}" style="text-align: center;">
          ${[companyInfo.address, companyInfo.city, companyInfo.country].filter(Boolean).join(', ')}
        </td>
      </tr>
      <tr>
        <td colspan="${headers.length}" style="text-align: center;">
          ${companyInfo.phone ? `<b>Tel:</b> ${companyInfo.phone} ` : ''}
          ${companyInfo.email ? `<b>Email:</b> ${companyInfo.email}` : ''}
        </td>
      </tr>
      ${bankDetails ? `<tr><td colspan="${headers.length}" style="text-align: center;"><b>Banking Details:</b> ${bankDetails}</td></tr>` : ''}
      <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    `;
  }

  // Build Title Row
  let titleRow = '';
  if (title) {
    titleRow = `
      <tr>
        <td colspan="${headers.length}" style="font-size: 14pt; font-weight: bold; color: #2DAAE1; text-align: center; border-bottom: 1pt solid #2DAAE1;">${title.toUpperCase()}</td>
      </tr>
      <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    `;
  }

  // Build HTML table
  const table = `
    <table>
      <thead>
        ${headerRows}
        ${titleRow}
        <tr style="background-color: #f3f4f6; font-weight: bold; border: 0.5pt solid #cccccc;">
          ${headers.map(h => `<th style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: left;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(r => `
          <tr>
            ${r.map(cell => `<td style="border: 0.5pt solid #cccccc; padding: 5pt;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 0.5pt solid #cccccc; }
        </style>
      </head>
      <body>
        ${table}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCustomerStatementSummaryToCSV = (statements: CustomerStatementData[], filename?: string) => {
  const totalOutstanding = statements.reduce((sum, s) => sum + s.total_outstanding, 0);
  const totalOverdue = statements.reduce((sum, s) => sum + s.overdue_amount, 0);
  const totalCurrent = statements.reduce((sum, s) => sum + s.current_due, 0);
  const overdueCustomers = statements.filter(s => s.overdue_amount > 0).length;

  const summaryData = [
    ['Customer Statements Summary', ''],
    ['Generated Date', new Date().toLocaleDateString()],
    ['', ''],
    ['Total Customers', statements.length.toString()],
    ['Total Outstanding', `$${totalOutstanding.toFixed(2)}`],
    ['Total Current Due', `$${totalCurrent.toFixed(2)}`],
    ['Total Overdue', `$${totalOverdue.toFixed(2)}`],
    ['Customers with Overdue', overdueCustomers.toString()],
    ['', ''],
    ['Customer Details:', ''],
    ['Customer Name', 'Total Outstanding', 'Current Due', 'Overdue Amount', 'Days Overdue', 'Status'],
    ...statements.map(s => [
      s.customer_name,
      `$${s.total_outstanding.toFixed(2)}`,
      `$${s.current_due.toFixed(2)}`,
      `$${s.overdue_amount.toFixed(2)}`,
      s.days_overdue.toString(),
      s.total_outstanding === 0 ? 'Paid Up' : s.overdue_amount > 0 ? 'Overdue' : 'Current'
    ])
  ];

  const csvContent = summaryData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `customer-statements-summary-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Export individual customer statement with aging detail by invoice
export const exportCustomerStatementDetailToExcel = (
  customerName: string,
  invoices: any[],
  payments: any[],
  filename?: string,
  options?: ExcelExportOptions
) => {
  const today = new Date();
  const { title, companyInfo } = options || {};

  // Calculate aging buckets
  const aging = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0
  };

  // Get outstanding invoices with aging classification
  const statementDate = today.toISOString().split('T')[0];
  const outstandingInvoices = invoices
    .filter(inv => (inv.total_amount - (inv.paid_amount || 0)) > 0)
    .map(inv => {
      const outstanding = inv.total_amount - (inv.paid_amount || 0);
      const dueDate = new Date(inv.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      let agingBucket = 'Current';
      if (daysOverdue > 90) {
        aging.over90 += outstanding;
        agingBucket = 'Over 90 Days';
      } else if (daysOverdue > 60) {
        aging.days90 += outstanding;
        agingBucket = '61-90 Days';
      } else if (daysOverdue > 30) {
        aging.days60 += outstanding;
        agingBucket = '31-60 Days';
      } else if (daysOverdue > 0) {
        aging.days30 += outstanding;
        agingBucket = '1-30 Days';
      } else {
        aging.current += outstanding;
      }

      return {
        invoiceNumber: inv.invoice_number,
        invoiceDate: new Date(inv.invoice_date).toLocaleDateString(),
        dueDate: new Date(inv.due_date).toLocaleDateString(),
        amount: inv.total_amount.toFixed(2),
        paid: (inv.paid_amount || 0).toFixed(2),
        outstanding: outstanding.toFixed(2),
        daysOverdue: Math.max(0, daysOverdue),
        agingBucket,
        agingNarrative: getAgingNarrative(inv.due_date, statementDate)
      };
    })
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  // Build HTML table
  const headers = ['Invoice #', 'Invoice Date', 'Due Date', 'Amount', 'Paid', 'Outstanding', 'Days Overdue', 'Aging Status', 'Aging Bucket'];

  let headerRows = '';
  if (companyInfo) {
    const bankDetails = buildBankDetailsHTML(companyInfo);
    headerRows = `
      <tr>
        <td colspan="${headers.length}" style="font-size: 18pt; font-weight: bold; color: #2BB673; text-align: center;">${companyInfo.name}</td>
      </tr>
      ${companyInfo.tax_number ? `<tr><td colspan="${headers.length}" style="text-align: center;"><b>PIN:</b> ${companyInfo.tax_number}</td></tr>` : ''}
      <tr>
        <td colspan="${headers.length}" style="text-align: center;">
          ${[companyInfo.address, companyInfo.city, companyInfo.country].filter(Boolean).join(', ')}
        </td>
      </tr>
      <tr>
        <td colspan="${headers.length}" style="text-align: center;">
          ${companyInfo.phone ? `<b>Tel:</b> ${companyInfo.phone} ` : ''}
          ${companyInfo.email ? `<b>Email:</b> ${companyInfo.email}` : ''}
        </td>
      </tr>
      ${bankDetails ? `<tr><td colspan="${headers.length}" style="text-align: center;"><b>Banking Details:</b> ${bankDetails}</td></tr>` : ''}
      <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    `;
  }

  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + parseFloat(inv.outstanding), 0);

  const agingSummaryRow = `
    <tr><td colspan="${headers.length}" style="font-size: 12pt; font-weight: bold; color: #1F2937; margin-top: 10pt;">CUSTOMER STATEMENT: ${customerName}</td></tr>
    <tr><td colspan="${headers.length}" style="font-size: 11pt; color: #666; padding: 5pt;">As of ${today.toLocaleDateString()}</td></tr>
    <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    <tr><td colspan="${headers.length}" style="font-size: 11pt; font-weight: bold; color: #1F2937;">AGING SUMMARY</td></tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;"><b>Category</b></td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;"><b>Amount</b></td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Current</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; color: #2BB673; font-weight: bold;">$${aging.current.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">1-30 Days Overdue</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${aging.days30.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">31-60 Days Overdue</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${aging.days60.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">61-90 Days Overdue</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${aging.days90.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Over 90 Days Overdue</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; color: #DC2626; font-weight: bold;">$${aging.over90.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; font-weight: bold;">TOTAL OUTSTANDING</td>
      <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; font-weight: bold; color: #1F2937;">$${totalOutstanding.toFixed(2)}</td>
      <td colspan="${headers.length - 2}" style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
    </tr>
    <tr><td colspan="${headers.length}">&nbsp;</td></tr>
    <tr><td colspan="${headers.length}" style="font-size: 11pt; font-weight: bold; color: #1F2937;">OUTSTANDING INVOICES</td></tr>
    <tr><td colspan="${headers.length}">&nbsp;</td></tr>
  `;

  const table = `
    <table>
      <thead>
        ${headerRows}
        ${agingSummaryRow}
        <tr style="background-color: #f3f4f6; font-weight: bold; border: 0.5pt solid #cccccc;">
          ${headers.map(h => `<th style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: left;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${outstandingInvoices.map(inv => `
          <tr>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt;">${inv.invoiceNumber}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt;">${inv.invoiceDate}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt;">${inv.dueDate}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${inv.amount}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${inv.paid}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; font-weight: bold;">$${inv.outstanding}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">${inv.daysOverdue}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt; font-size: 10pt;">${inv.agingNarrative}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt;">${inv.agingBucket}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 0.5pt solid #cccccc; }
        </style>
      </head>
      <body>
        ${table}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename || `statement-${customerName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCustomerStatementSummaryToExcel = (statements: CustomerStatementData[], filename?: string, options?: ExcelExportOptions) => {
  const totalOutstanding = statements.reduce((sum, s) => sum + s.total_outstanding, 0);
  const totalOverdue = statements.reduce((sum, s) => sum + s.overdue_amount, 0);
  const totalCurrent = statements.reduce((sum, s) => sum + s.current_due, 0);
  const overdueCustomers = statements.filter(s => s.overdue_amount > 0).length;

  const { title, companyInfo } = options || {};

  // Build Company Header Rows
  let headerRows = '';
  if (companyInfo) {
    const bankDetails = buildBankDetailsHTML(companyInfo);
    headerRows = `
      <tr>
        <td colspan="2" style="font-size: 18pt; font-weight: bold; color: #2BB673; text-align: center;">${companyInfo.name}</td>
      </tr>
      ${companyInfo.tax_number ? `<tr><td colspan="2" style="text-align: center;"><b>PIN:</b> ${companyInfo.tax_number}</td></tr>` : ''}
      <tr>
        <td colspan="2" style="text-align: center;">
          ${[companyInfo.address, companyInfo.city, companyInfo.country].filter(Boolean).join(', ')}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="text-align: center;">
          ${companyInfo.phone ? `<b>Tel:</b> ${companyInfo.phone} ` : ''}
          ${companyInfo.email ? `<b>Email:</b> ${companyInfo.email}` : ''}
        </td>
      </tr>
      ${bankDetails ? `<tr><td colspan="2" style="text-align: center;"><b>Banking Details:</b> ${bankDetails}</td></tr>` : ''}
      <tr><td colspan="2">&nbsp;</td></tr>
    `;
  }

  // Build Title Row
  let titleRow = '';
  if (title) {
    titleRow = `
      <tr>
        <td colspan="2" style="font-size: 14pt; font-weight: bold; color: #2DAAE1; text-align: center; border-bottom: 1pt solid #2DAAE1;">${title.toUpperCase()}</td>
      </tr>
      <tr><td colspan="2">&nbsp;</td></tr>
    `;
  }

  // Build HTML table
  const table = `
    <table>
      <thead>
        ${headerRows}
        ${titleRow}
      </thead>
      <tbody>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; font-weight: bold;">Generated Date</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">${new Date().toLocaleDateString()}</td>
        </tr>
        <tr><td colspan="2">&nbsp;</td></tr>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; font-weight: bold;">SUMMARY TOTALS</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">&nbsp;</td>
        </tr>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Total Customers</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">${statements.length}</td>
        </tr>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Total Outstanding</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; font-weight: bold;">$${totalOutstanding.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Total Current Due</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; color: #2BB673;">$${totalCurrent.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Total Overdue</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right; color: #DC2626; font-weight: bold;">$${totalOverdue.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Customers with Overdue</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">${overdueCustomers}</td>
        </tr>
        <tr><td colspan="2">&nbsp;</td></tr>
        <tr>
          <td colspan="2" style="font-size: 12pt; font-weight: bold; color: #1F2937; border: none;">CUSTOMER BREAKDOWN</td>
        </tr>
        <tr><td colspan="2">&nbsp;</td></tr>
        <tr style="background-color: #f3f4f6; font-weight: bold;">
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">Customer Name</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">Total Outstanding</td>
        </tr>
        ${statements.map(s => `
          <tr>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt;">${s.customer_name}</td>
            <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${s.total_outstanding.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr style="background-color: #f3f4f6; font-weight: bold;">
          <td style="border: 0.5pt solid #cccccc; padding: 5pt;">TOTAL</td>
          <td style="border: 0.5pt solid #cccccc; padding: 5pt; text-align: right;">$${totalOutstanding.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 0.5pt solid #cccccc; }
        </style>
      </head>
      <body>
        ${table}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename || `customer-statements-summary-${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
