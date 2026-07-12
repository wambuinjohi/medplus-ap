import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Send, X, AlertCircle, CheckCircle, Clock, FileSpreadsheet } from 'lucide-react';
import { usePayments, useCompanies } from '@/hooks/useDatabase';
import { useInvoicesFixed as useInvoices } from '@/hooks/useInvoicesFixed';
import { generateCustomerStatementPDF } from '@/utils/pdfGenerator';
import { exportCustomerStatementDetailToExcel } from '@/utils/csvExporter';
import { getAgingNarrative } from '@/utils/ageCalculations';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomerCreditNoteAllocations, getStatementDateRangeLabel, isStatementDateInRange } from '@/utils/statementHelpers';

interface CustomerStatementPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
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
  };
  statementDate?: string;
}

interface CustomerStatementPreviewModalPropsWithDateRange extends CustomerStatementPreviewModalProps {
  dateRange?: string;
}

export default function CustomerStatementPreviewModal({
  isOpen,
  onClose,
  customer,
  statementDate = new Date().toISOString().split('T')[0],
  dateRange = 'all_time'
}: CustomerStatementPreviewModalPropsWithDateRange) {
  const { data: companies } = useCompanies();
  const { data: invoices } = useInvoices();
  const { data: payments } = usePayments();

  const dateFilter = { range: dateRange };
  const { data: creditNoteAllocations = [] } = useQuery({
    queryKey: ['statementCreditNoteAllocations', customer.customer_id, dateRange],
    queryFn: () => fetchCustomerCreditNoteAllocations(customer.customer_id, dateFilter),
    enabled: isOpen
  });
  const invoiceInRange = (inv: any) => isStatementDateInRange(inv?.invoice_date, dateFilter);

  // Get customer's invoices and payments
  const customerInvoices = invoices?.filter(inv =>
    inv.customer_id === customer.customer_id && invoiceInRange(inv)
  ) || [];
  const customerPayments = payments?.filter(pay =>
    pay.customer_id === customer.customer_id && isStatementDateInRange(pay.payment_date, dateFilter)
  ) || [];

  // Get outstanding invoices
  const outstandingInvoices = customerInvoices.filter(inv =>
    (inv.total_amount - (inv.paid_amount || 0)) > 0
  );

  // Calculate aging
  const today = new Date();
  const aging = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0
  };

  outstandingInvoices.forEach(inv => {
    const dueDate = new Date(inv.due_date);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const outstanding = inv.total_amount - (inv.paid_amount || 0);

    if (daysOverdue <= 0) {
      aging.current += outstanding;
    } else if (daysOverdue <= 30) {
      aging.days30 += outstanding;
    } else if (daysOverdue <= 60) {
      aging.days60 += outstanding;
    } else if (daysOverdue <= 90) {
      aging.days90 += outstanding;
    } else {
      aging.over90 += outstanding;
    }
  });

  const getStatusBadge = (daysOverdue: number, outstanding: number) => {
    if (outstanding === 0) {
      return <Badge variant="outline" className="bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
    }
    if (daysOverdue > 0) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Current</Badge>;
  };

  const handleGeneratePDF = async () => {
    try {
      const customerData = {
        id: customer.customer_id,
        name: customer.customer_name,
        email: customer.customer_email,
        customer_code: customer.customer_id
      };
      
      // Get current company details for PDF
      const companyDetails = companies?.[0] ? {
        name: companies[0].name,
        address: companies[0].address,
        city: companies[0].city,
        country: companies[0].country,
        phone: companies[0].phone,
        email: companies[0].email,
        tax_number: companies[0].tax_number,
        logo_url: companies[0].logo_url,
        bank_name: companies[0].bank_name,
        bank_account_number: companies[0].bank_account_number,
        bank_account_name: companies[0].bank_account_name,
        swift_code: companies[0].swift_code,
        branch_code: companies[0].branch_code,
        paybill_number: companies[0].paybill_number
      } : undefined;

      await generateCustomerStatementPDF(customerData, customerInvoices, customerPayments, {
        statement_date: statementDate,
        date_range_label: getStatementDateRangeLabel(dateFilter)
      }, companyDetails, creditNoteAllocations);
      
      toast.success('Statement PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate statement PDF');
    }
  };

  const handleSendEmail = () => {
    if (!customer.customer_email) {
      toast.error('Customer has no email address');
      return;
    }

    // TODO: Implement actual email sending
    toast.success(`Statement would be sent to ${customer.customer_email}`);
  };

  const handleExportExcel = async () => {
    try {
      const companyDetails = companies?.[0] ? {
        name: companies[0].name,
        address: companies[0].address,
        city: companies[0].city,
        country: companies[0].country,
        phone: companies[0].phone,
        email: companies[0].email,
        tax_number: companies[0].tax_number,
        logo_url: companies[0].logo_url,
        bank_name: companies[0].bank_name,
        bank_account_number: companies[0].bank_account_number,
        bank_account_name: companies[0].bank_account_name,
        swift_code: companies[0].swift_code,
        branch_code: companies[0].branch_code,
        paybill_number: companies[0].paybill_number
      } : undefined;

      exportCustomerStatementDetailToExcel(
        customer.customer_name,
        customerInvoices,
        customerPayments,
        undefined,
        {
          title: `Customer Statement - ${statementDate}`,
          companyInfo: companyDetails
        }
      );

      toast.success('Statement exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export statement to Excel');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Customer Statement Preview</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statement for {customer.customer_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Statement Date</p>
                  <p className="font-medium">{new Date(statementDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Period</p>
                  <p className="font-medium">{getStatementDateRangeLabel(dateFilter)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Email</p>
                  <p className="font-medium">{customer.customer_email || 'No email'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="font-bold text-base text-destructive">${customer.total_outstanding.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Overdue</p>
                  <p className="font-medium">{customer.days_overdue > 0 ? `${customer.days_overdue} days` : 'Current'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aging Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-sm font-bold text-success">${aging.current.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">1-30 Days</p>
                  <p className="text-sm font-bold text-warning">${aging.days30.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">31-60 Days</p>
                  <p className="text-sm font-bold text-orange-600">${aging.days60.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">61-90 Days</p>
                  <p className="text-sm font-bold text-red-600">${aging.days90.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Over 90 Days</p>
                  <p className="text-sm font-bold text-destructive">${aging.over90.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {outstandingInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Outstanding Invoices</h3>
                  <p className="text-muted-foreground">This customer has no outstanding balance.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Aging Status</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingInvoices.map((invoice) => {
                      const outstanding = invoice.total_amount - (invoice.paid_amount || 0);
                      const daysOverdue = Math.max(0, Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)));
                      const agingNarrative = getAgingNarrative(invoice.due_date, statementDate);

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                          <TableCell>${(invoice.paid_amount || 0).toFixed(2)}</TableCell>
                          <TableCell className="font-medium">${outstanding.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{agingNarrative}</TableCell>
                          <TableCell>{getStatusBadge(daysOverdue, outstanding)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          {customerPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPayments
                      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                      .slice(0, 5)
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method?.replace('_', ' ')}</TableCell>
                          <TableCell>{payment.reference_number || '-'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {creditNoteAllocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Allocated Credit Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Credit Note</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Allocated Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditNoteAllocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell>{new Date(allocation.allocation_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{allocation.credit_notes?.credit_note_number || 'Credit Note'}</TableCell>
                        <TableCell>{allocation.invoices?.invoice_number || '-'}</TableCell>
                        <TableCell className="text-right text-success">${Number(allocation.allocated_amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {companies?.[0] && (companies[0].bank_name || companies[0].bank_account_number || companies[0].bank_account_name) && (
            <Card>
              <CardHeader>
                <CardTitle>Banking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {companies[0].bank_account_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-medium">{companies[0].bank_account_name}</p>
                    </div>
                  )}
                  {companies[0].bank_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Bank</p>
                      <p className="font-medium">{companies[0].bank_name}</p>
                    </div>
                  )}
                  {companies[0].bank_account_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{companies[0].bank_account_number}</p>
                    </div>
                  )}
                  {companies[0].swift_code && (
                    <div>
                      <p className="text-sm text-muted-foreground">Swift Code</p>
                      <p className="font-medium">{companies[0].swift_code}</p>
                    </div>
                  )}
                  {companies[0].branch_code && (
                    <div>
                      <p className="text-sm text-muted-foreground">Branch Code</p>
                      <p className="font-medium">{companies[0].branch_code}</p>
                    </div>
                  )}
                  {companies[0].paybill_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paybill Number</p>
                      <p className="font-medium">{companies[0].paybill_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline" onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {customer.customer_email && (
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
