import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { generateCustomerStatementPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { useCustomers, usePayments, useCompanies } from '@/hooks/useDatabase';
import { useInvoicesFixed as useInvoices } from '@/hooks/useInvoicesFixed';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyCreditNoteAllocations, getStatementDateRangeLabel, isStatementDateInRange } from '@/utils/statementHelpers';
import { exportDataToExcel } from '@/utils/csvExporter';

// Helper function to compute customer statements from real data
const computeCustomerStatements = (customers: any[], invoices: any[], payments: any[], creditNoteAllocations: any[] = []) => {
  if (!customers || !invoices || !payments) return [];

  return customers.map(customer => {
    const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
    const customerPayments = payments.filter(pay => pay.customer_id === customer.id);
    const customerCreditNoteAllocations = creditNoteAllocations.filter(allocation => allocation.credit_notes?.customer_id === customer.id);

    const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
    const totalPaid = customerPayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
    const totalCreditNotes = customerCreditNoteAllocations.reduce((sum, allocation) => sum + (Number(allocation.allocated_amount) || 0), 0);
    const currentBalance = totalInvoiced - totalPaid - totalCreditNotes;

    // Calculate aging analysis
    const today = new Date();
    let current = 0, days30 = 0, days60 = 0, days90 = 0;

    const outstandingInvoices = customerInvoices.filter(invoice =>
      (Number(invoice.total_amount) || 0) - (Number(invoice.paid_amount) || 0) > 0
    );

    outstandingInvoices.forEach(invoice => {
      const dueDate = new Date(invoice.due_date || invoice.invoice_date);
      const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const unpaidAmount = Number(invoice.total_amount) - Number(invoice.paid_amount || 0);

      if (daysPastDue <= 0) current += unpaidAmount;
      else if (daysPastDue <= 30) days30 += unpaidAmount;
      else if (daysPastDue <= 60) days60 += unpaidAmount;
      else days90 += unpaidAmount;
    });

    const overdueAmount = days30 + days60 + days90;

    // Build transactions array
    const allTransactions = [
      ...customerInvoices.map(inv => ({
        date: inv.invoice_date,
        type: 'Invoice',
        reference: inv.invoice_number,
        description: `Invoice - ${inv.invoice_number}`,
        debit: Number(inv.total_amount) || 0,
        credit: 0,
        balance: 0 // Will be calculated
      })),
      ...customerPayments.map(pay => ({
        date: pay.payment_date,
        type: 'Payment',
        reference: pay.payment_number,
        description: `Payment - ${pay.payment_method || 'Cash'}`,
        debit: 0,
        credit: Number(pay.amount) || 0,
        balance: 0 // Will be calculated
      })),
      ...customerCreditNoteAllocations.map(allocation => ({
        date: allocation.allocation_date,
        type: 'Credit Note',
        reference: allocation.credit_notes?.credit_note_number || 'Credit Note',
        description: allocation.invoices?.invoice_number
          ? `Credit Note ${allocation.credit_notes?.credit_note_number || ''} - Applied to Invoice ${allocation.invoices.invoice_number}`
          : `Credit Note - ${allocation.credit_notes?.credit_note_number || ''}`,
        debit: 0,
        credit: Number(allocation.allocated_amount) || 0,
        balance: 0
      }))
    ];

    // Sort by date and calculate running balance
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    allTransactions.forEach(trans => {
      runningBalance += trans.debit - trans.credit;
      trans.balance = runningBalance;
    });

    return {
      customerId: customer.id,
      customerName: customer.name,
      customerCode: customer.customer_code,
      address: customer.address || '',
      email: customer.email || '',
      phone: customer.phone || '',
      creditLimit: Number(customer.credit_limit) || 0,
      currentBalance: currentBalance,
      overdueAmount: overdueAmount,
      lastStatementDate: new Date().toISOString().split('T')[0],
      transactions: allTransactions.slice(-10), // Show last 10 transactions
      agingAnalysis: {
        current: current,
        days30: days30,
        days60: days60,
        days90: days90,
        total: current + days30 + days60 + days90
      }
    };
  });
};

const StatementOfAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [dateRange, setDateRange] = useState('all_time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateValidationError, setDateValidationError] = useState('');

  const isDateRangeValid = !startDate || !endDate || new Date(startDate) <= new Date(endDate);

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      if (endDate && new Date(value) > new Date(endDate)) {
        setDateValidationError('Start date cannot be after end date');
      } else {
        setDateValidationError('');
      }
    } else {
      setEndDate(value);
      if (startDate && new Date(startDate) > new Date(value)) {
        setDateValidationError('End date cannot be before start date');
      } else {
        setDateValidationError('');
      }
    }
  };

  const dateFilter = {
    range: dateRange,
    startDate: isDateRangeValid ? startDate : '',
    endDate: isDateRangeValid ? endDate : ''
  };

  // Real data hooks
  const { data: companies } = useCompanies();
  const currentCompany = companies?.[0];
  const { data: customers } = useCustomers(currentCompany?.id);
  const { data: invoices } = useInvoices(currentCompany?.id);
  const { data: payments } = usePayments(currentCompany?.id);
  const { data: creditNoteAllocations = [] } = useQuery({
    queryKey: ['statementCreditNoteAllocations', currentCompany?.id, dateRange, startDate, endDate],
    queryFn: () => fetchCompanyCreditNoteAllocations(currentCompany?.id, dateFilter),
    enabled: Boolean(currentCompany?.id)
  });
  const filteredInvoices = (invoices || []).filter(invoice => isStatementDateInRange(invoice.invoice_date, dateFilter));
  const filteredPayments = (payments || []).filter(payment => isStatementDateInRange(payment.payment_date, dateFilter));

  const computedStatements = computeCustomerStatements(customers || [], filteredInvoices, filteredPayments, creditNoteAllocations);

  // Set first customer as default on load
  useEffect(() => {
    if (!selectedCustomerId && computedStatements.length > 0) {
      setSelectedCustomerId(computedStatements[0].customerId.toString());
    }
  }, [computedStatements, selectedCustomerId]);

  const handleDownloadStatement = async (statement: any) => {
    try {
      // Find the real customer in database
      const customer = customers?.find(c => c.name === statement.customerName);
      if (!customer) {
        toast.error('Customer not found in database');
        return;
      }

      const customerInvoices = filteredInvoices.filter(inv => inv.customer_id === customer.id);
      const customerPayments = filteredPayments.filter(pay => pay.customer_id === customer.id);
      const customerCreditNoteAllocations = creditNoteAllocations.filter(allocation => allocation.credit_notes?.customer_id === customer.id);

      // Prepare company details for PDF
      const companyDetails = currentCompany ? {
        name: currentCompany.name,
        address: currentCompany.address,
        city: currentCompany.city,
        country: currentCompany.country,
        phone: currentCompany.phone,
        email: currentCompany.email,
        tax_number: currentCompany.tax_number,
        logo_url: currentCompany.logo_url,
        bank_name: currentCompany.bank_name,
        bank_account_number: currentCompany.bank_account_number,
        bank_account_name: currentCompany.bank_account_name,
        swift_code: currentCompany.swift_code,
        branch_code: currentCompany.branch_code,
        paybill_number: currentCompany.paybill_number
      } : undefined;

      // Generate PDF with real data including credit notes
      await generateCustomerStatementPDF(
        customer,
        customerInvoices,
        customerPayments,
        {
          statement_date: new Date().toISOString().split('T')[0],
          date_range_label: getStatementDateRangeLabel(dateFilter)
        },
        companyDetails,
        customerCreditNoteAllocations
      );

      toast.success(`Statement PDF generated for ${statement.customerName}`);
    } catch (error) {
      console.error('Error generating statement PDF:', error);
      toast.error('Failed to generate statement PDF. Please try again.');
    }
  };

  const handleDownloadExcel = (statement: any) => {
    try {
      const headers = ['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'];
      const data = statement.transactions.map((trans: any) => [
        new Date(trans.date).toLocaleDateString(),
        trans.type,
        trans.reference,
        trans.description,
        trans.debit.toFixed(2),
        trans.credit.toFixed(2),
        trans.balance.toFixed(2)
      ]);

      exportDataToExcel(
        data,
        headers,
        `statement_${statement.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`,
        {
          title: `Statement of Account - ${statement.customerName}`,
          companyInfo: currentCompany
        }
      );
      toast.success(`Statement Excel exported for ${statement.customerName}`);
    } catch (error) {
      console.error('Error exporting statement to Excel:', error);
      toast.error('Failed to export statement to Excel');
    }
  };

  const handleExportAllExcel = () => {
    if (filteredStatements.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Customer Code', 'Customer Name', 'Email', 'Current Balance', 'Overdue Amount', 'Credit Limit'];
    const data = filteredStatements.map(s => [
      s.customerCode,
      s.customerName,
      s.email,
      s.currentBalance.toFixed(2),
      s.overdueAmount.toFixed(2),
      s.creditLimit.toFixed(2)
    ]);

    exportDataToExcel(
      data,
      headers,
      `all_customer_statements_summary_${new Date().toISOString().split('T')[0]}.xls`,
      {
        title: 'All Customer Statements Summary',
        companyInfo: currentCompany
      }
    );
    toast.success('Summary of all statements exported to Excel');
  };

  const filteredStatements = computedStatements.filter(statement => {
    const matchesSearch = statement.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         statement.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOverdue = !showOverdueOnly || statement.overdueAmount > 0;
    return matchesSearch && matchesOverdue;
  });

  const selectedStatement = selectedCustomerId
    ? computedStatements.find(s => s.customerId.toString() === selectedCustomerId)
    : null;

  const getAccountStatus = (currentBalance: number, overdueAmount: number, creditLimit: number) => {
    if (overdueAmount > 0) {
      return { status: 'overdue', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle };
    } else if (currentBalance > creditLimit * 0.8) {
      return { status: 'near_limit', color: 'bg-warning text-warning-foreground', icon: Clock };
    } else {
      return { status: 'good', color: 'bg-success text-success-foreground', icon: CheckCircle };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const totalOutstanding = filteredStatements.reduce((sum, statement) => sum + statement.currentBalance, 0);
  const totalOverdue = filteredStatements.reduce((sum, statement) => sum + statement.overdueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statement of Accounts</h1>
          <p className="text-muted-foreground">
            Customer account statements and aging analysis
            {selectedStatement && ` • ${selectedStatement.customerName}`}
            {dateRange !== 'all_time' && ` • Period: ${getStatementDateRangeLabel(dateFilter)}`}
          </p>
        </div>
        <div className="flex space-x-2">
          {selectedStatement && (
            <>
              <Button
                variant="outline"
                onClick={() => handleDownloadExcel(selectedStatement)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadStatement(selectedStatement)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </>
          )}
          <Button className="shadow-card">
            <Plus className="mr-2 h-4 w-4" />
            Generate Statements
          </Button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Left Pane: Customer List */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Click to view statement</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 pb-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showOverdueOnly ? "default" : "outline"}
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                className="w-full"
                size="sm"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Overdue Only
              </Button>
            </div>

            {/* Customer List */}
            <div className="border-t max-h-[500px] overflow-y-auto">
              {filteredStatements.length > 0 ? (
                filteredStatements.map((statement) => {
                  const statusInfo = getAccountStatus(statement.currentBalance, statement.overdueAmount, statement.creditLimit);
                  const isSelected = selectedCustomerId === statement.customerId.toString();
                  return (
                    <button
                      key={statement.customerId}
                      onClick={() => setSelectedCustomerId(statement.customerId.toString())}
                      className={`w-full text-left px-6 py-3 border-b transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{statement.customerName}</p>
                          <p className="text-xs text-muted-foreground">{statement.customerCode}</p>
                          <p className={`text-xs font-semibold mt-1 ${
                            statement.overdueAmount > 0 ? 'text-destructive' : 'text-success'
                          }`}>
                            {formatCurrency(statement.currentBalance)}
                          </p>
                        </div>
                        <Badge className={`${statusInfo.color} text-xs flex-shrink-0`} variant="default">
                          {statusInfo.status === 'good' && '✓'}
                          {statusInfo.status === 'overdue' && '!'}
                          {statusInfo.status === 'near_limit' && '⚠'}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No customers match your search
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-t p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Outstanding</span>
                <span className="font-semibold">{formatCurrency(totalOutstanding)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-semibold text-destructive">{formatCurrency(totalOverdue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Customers</span>
                <span className="font-semibold">{filteredStatements.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Pane: Individual Statement */}
        <div className="lg:col-span-2">
          {selectedStatement ? (
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStatement.customerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStatement.customerCode} • {selectedStatement.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedStatement.address}</p>
                  </div>
                  <Badge className={getAccountStatus(selectedStatement.currentBalance, selectedStatement.overdueAmount, selectedStatement.creditLimit).color}>
                    {getAccountStatus(selectedStatement.currentBalance, selectedStatement.overdueAmount, selectedStatement.creditLimit).status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Date Range Filter */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <Label className="font-semibold">Transaction Date Range</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={dateRange === 'all_time' ? 'default' : 'outline'}
                      onClick={() => {
                        setDateRange('all_time');
                        setStartDate('');
                        setEndDate('');
                      }}
                      size="sm"
                    >
                      All Time
                    </Button>
                    <Button
                      variant={dateRange === 'last_30_days' ? 'default' : 'outline'}
                      onClick={() => {
                        setDateRange('last_30_days');
                        setStartDate('');
                        setEndDate('');
                      }}
                      size="sm"
                    >
                      Last 30 Days
                    </Button>
                    <Button
                      variant={dateRange === 'last_90_days' ? 'default' : 'outline'}
                      onClick={() => {
                        setDateRange('last_90_days');
                        setStartDate('');
                        setEndDate('');
                      }}
                      size="sm"
                    >
                      Last 90 Days
                    </Button>
                    <Button
                      variant={dateRange === 'this_year' ? 'default' : 'outline'}
                      onClick={() => {
                        setDateRange('this_year');
                        setStartDate('');
                        setEndDate('');
                      }}
                      size="sm"
                    >
                      This Year
                    </Button>
                    <Button
                      variant={dateRange === 'custom' ? 'default' : 'outline'}
                      onClick={() => setDateRange('custom')}
                      size="sm"
                    >
                      Custom Range
                    </Button>
                  </div>

                  {dateRange === 'custom' && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="start_date" className="text-xs">Start Date</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={startDate}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className={`h-9 ${startDate && endDate && new Date(startDate) > new Date(endDate) ? 'border-destructive' : ''}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date" className="text-xs">End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={endDate}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className={`h-9 ${startDate && endDate && new Date(startDate) > new Date(endDate) ? 'border-destructive' : ''}`}
                          />
                        </div>
                      </div>
                      {dateValidationError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {dateValidationError}
                        </p>
                      )}
                      {startDate && endDate && isDateRangeValid && (
                        <div className="text-xs text-muted-foreground pt-2 px-3 py-2 bg-success/10 rounded border border-success/20">
                          ✓ Showing transactions from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Account Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Current Balance</p>
                    <p className="text-sm font-bold text-primary">{formatCurrency(selectedStatement.currentBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Credit Limit</p>
                    <p className="text-sm font-bold">{formatCurrency(selectedStatement.creditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Available Credit</p>
                    <p className="text-sm font-bold text-success">
                      {formatCurrency(selectedStatement.creditLimit - selectedStatement.currentBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Overdue Amount</p>
                    <p className={`text-sm font-bold ${selectedStatement.overdueAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(selectedStatement.overdueAmount)}
                    </p>
                  </div>
                </div>

                {/* Aging Analysis */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Aging Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Current (0-30)</p>
                      <p className="text-sm font-bold text-success">{formatCurrency(selectedStatement.agingAnalysis.current)}</p>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">31-60 days</p>
                      <p className="text-sm font-bold text-warning">{formatCurrency(selectedStatement.agingAnalysis.days30)}</p>
                    </div>
                    <div className="text-center p-3 bg-orange-100 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">61-90 days</p>
                      <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedStatement.agingAnalysis.days60)}</p>
                    </div>
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">90+ days</p>
                      <p className="text-sm font-bold text-destructive">{formatCurrency(selectedStatement.agingAnalysis.days90)}</p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Total</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(selectedStatement.agingAnalysis.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Recent Transactions</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Reference</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-right text-xs">Debit</TableHead>
                          <TableHead className="text-right text-xs">Credit</TableHead>
                          <TableHead className="text-right text-xs">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStatement.transactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === 'Payment' ? 'default' : 'secondary'} className="text-xs">
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{transaction.reference}</TableCell>
                            <TableCell className="text-xs">{transaction.description}</TableCell>
                            <TableCell className="text-right text-xs text-destructive">
                              {transaction.debit > 0 ? formatCurrency(transaction.debit) : ''}
                            </TableCell>
                            <TableCell className="text-right text-xs text-success">
                              {transaction.credit > 0 ? formatCurrency(transaction.credit) : ''}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium">
                              {formatCurrency(transaction.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card flex items-center justify-center min-h-[600px]">
              <CardContent className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a Customer</h3>
                <p className="text-muted-foreground">Choose a customer from the list to view their statement</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatementOfAccounts;
