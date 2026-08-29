import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Receipt,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Send,
  DollarSign,
  Edit,
  Trash2,
  CreditCard
} from 'lucide-react';
import { useDeleteInvoice } from '@/hooks/useInvoicesFixed';
import { TermsAndConditions } from '@/components/ui/TermsAndConditions';
import { supabase } from '@/integrations/supabase/client';

interface ViewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  onEdit: () => void;
  onDownload: () => void;
  onSend: () => void;
  onRecordPayment: () => void;
  onDelete?: () => void;
}

export function ViewInvoiceModal({
  open,
  onOpenChange,
  invoice,
  onEdit,
  onDownload,
  onSend,
  onRecordPayment,
  onDelete
}: ViewInvoiceModalProps) {
  if (!invoice) return null;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const deleteInvoice = useDeleteInvoice();

  // Fetch credit note allocations for this invoice
  useEffect(() => {
    if (open && invoice?.id) {
      setAllocationsLoading(true);
      supabase
        .from('credit_note_allocations')
        .select(`
          *,
          credit_notes!credit_note_id (
            credit_note_number,
            total_amount,
            balance
          )
        `)
        .eq('invoice_id', invoice.id)
        .order('allocation_date', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching allocations:', error);
          } else {
            setAllocations(data || []);
          }
          setAllocationsLoading(false);
        });
    }
  }, [open, invoice?.id]);

  const handleDeleteConfirm = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
      case 'sent':
        return 'bg-warning-light text-warning border-warning/20';
      case 'paid':
        return 'bg-success-light text-success border-success/20';
      case 'partial':
        return 'bg-primary-light text-primary border-primary/20';
      case 'overdue':
        return 'bg-destructive-light text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Receipt className="h-6 w-6 text-primary" />
              <div>
                <div className="flex items-center space-x-2">
                  <span>Invoice {invoice.invoice_number}</span>
                  <Badge variant="outline" className={getStatusColor(invoice.status)}>
                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  {formatCurrency(invoice.total_amount || 0)}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {invoice.status === 'draft' && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {invoice.customers?.email && invoice.status === 'draft' && (
                <Button variant="outline" size="sm" onClick={onSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              )}
              <Button size="sm" onClick={onRecordPayment}>
                <DollarSign className="h-4 w-4 mr-2" />
                {(invoice.balance_due || 0) > 0 ? 'Record Payment' : 'Payment Adjustment'}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Invoice details and line items
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium text-lg">{invoice.customers?.name || 'Unknown Customer'}</div>
                <div className="text-sm text-muted-foreground">{invoice.customers?.customer_code || 'N/A'}</div>
              </div>

              {invoice.customers?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{invoice.customers.email}</span>
                </div>
              )}

              {invoice.customers?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{invoice.customers.phone}</span>
                </div>
              )}

              {invoice.customers?.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div>{invoice.customers.address}</div>
                    {invoice.customers.city && (
                      <div className="text-muted-foreground">
                        {invoice.customers.city}, {invoice.customers.country || 'Kenya'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Invoice Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <div className="font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(invoice.invoice_date)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <div className="font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(invoice.due_date)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <div className="font-bold text-lg text-primary">
                    {formatCurrency(invoice.total_amount || 0)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Balance Due:</span>
                  <div className={`font-bold text-lg ${(invoice.balance_due || 0) > 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatCurrency(invoice.balance_due || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Invoice Items</span>
              <Badge variant="outline">
                {invoice.invoice_items?.length || 0} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!invoice.invoice_items || invoice.invoice_items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items found for this invoice
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Discount %</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead>Batch No</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoice_items.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.products?.name || item.description || 'Unknown Product'}
                          </div>
                          {item.description && item.description !== item.products?.name && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell>{item.discount_percentage || 0}%</TableCell>
                      <TableCell>{item.tax_percentage || 0}%</TableCell>
                      <TableCell>{item.batch_no || '-'}</TableCell>
                      <TableCell>{item.expiry_date ? formatDate(item.expiry_date) : '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.line_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Invoice Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(invoice.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">{formatCurrency(invoice.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-primary">{formatCurrency(invoice.total_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Paid:</span>
                    <span>{formatCurrency(invoice.paid_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Balance Due:</span>
                    <span className={`font-bold ${(invoice.balance_due || 0) > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(invoice.balance_due || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applied Credit Notes */}
        {allocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Applied Credit Notes</span>
                </div>
                <Badge variant="outline">
                  {allocations.length} credit note(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note #</TableHead>
                    <TableHead>Applied Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation: any) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-semibold text-primary"
                          onClick={() => {
                            // Could emit event to open credit note modal
                            console.log('View credit note:', allocation.credit_note_id);
                          }}
                        >
                          {allocation.credit_notes?.credit_note_number || 'N/A'}
                        </Button>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(allocation.allocated_amount || 0)}
                      </TableCell>
                      <TableCell>
                        {allocation.allocation_date ? formatDate(allocation.allocation_date) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {allocation.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total Applied Credit */}
              <div className="mt-6 border-t pt-4 flex justify-end">
                <div className="w-80">
                  <div className="flex justify-between text-lg border-b pb-2">
                    <span className="font-semibold">Total Credit Applied:</span>
                    <span className="font-bold text-success">
                      {formatCurrency(
                        allocations.reduce((sum: number, a: any) => sum + (a.allocated_amount || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Terms and Conditions */}
        <TermsAndConditions
          terms={invoice.terms_and_conditions}
          notes={invoice.notes}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Delete Invoice</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 mt-4">
            <p>Are you sure you want to delete invoice <span className="font-semibold text-foreground">{invoice.invoice_number}</span>?</p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium text-destructive">This action will:</p>
              <ul className="list-disc list-inside text-destructive/90 space-y-1">
                <li>Permanently delete this invoice</li>
                {invoice.quotation_id && <li>Reset linked quotation status to draft</li>}
                {invoice.quotation_id && <li>Restore product stock quantities</li>}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteInvoice.isPending}
          >
            {deleteInvoice.isPending ? 'Deleting...' : 'Delete Invoice'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
