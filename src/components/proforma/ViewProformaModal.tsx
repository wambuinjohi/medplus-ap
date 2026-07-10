import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Send,
  Calendar,
  User,
  Receipt,
  DollarSign,
  Trash2,
  CreditCard
} from 'lucide-react';
import { useDeleteProforma } from '@/hooks/useProforma';
import { TermsAndConditions } from '@/components/ui/TermsAndConditions';
import { supabase } from '@/integrations/supabase/client';

interface ProformaItem {
  id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  tax_amount: number;
  line_total: number;
  batch_no?: string;
  expiry_date?: string;
}

interface Proforma {
  id: string;
  proforma_number: string;
  proforma_date: string;
  valid_until: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  terms_and_conditions?: string;
  customers?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  proforma_items?: ProformaItem[];
}

interface ViewProformaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proforma: Proforma | null;
  onDownloadPDF?: (proforma: Proforma) => void;
  onSendEmail?: (proforma: Proforma) => void;
  onCreateInvoice?: (proforma: Proforma) => void;
  onDelete?: () => void;
}

export const ViewProformaModal = ({
  open,
  onOpenChange,
  proforma,
  onDownloadPDF,
  onSendEmail,
  onCreateInvoice,
  onDelete
}: ViewProformaModalProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const deleteProforma = useDeleteProforma();

  // Fetch credit note allocations for this proforma
  useEffect(() => {
    if (open && proforma?.id) {
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
        .eq('proforma_id', proforma.id)
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
  }, [open, proforma?.id]);

  if (!proforma) return null;

  const handleDeleteConfirm = async () => {
    try {
      await deleteProforma.mutateAsync(proforma.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting proforma:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'accepted':
        return <Badge variant="destructive">Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      case 'converted':
        return <Badge variant="destructive">Converted to Invoice</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleDownload = () => {
    onDownloadPDF?.(proforma);
  };

  const handleSendEmail = () => {
    onSendEmail?.(proforma);
  };

  const handleCreateInvoice = () => {
    onCreateInvoice?.(proforma);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Proforma Invoice #{proforma.proforma_number}
          </DialogTitle>
          <DialogDescription>
            View proforma invoice details and perform actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proforma Details
                </CardTitle>
                {getStatusBadge(proforma.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proforma Number</p>
                  <p className="text-sm">{proforma.proforma_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(proforma.proforma_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(proforma.valid_until)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${proforma.total_amount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {proforma.customers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{proforma.customers.name}</p>
                  {proforma.customers.email && (
                    <p className="text-sm text-muted-foreground">{proforma.customers.email}</p>
                  )}
                  {proforma.customers.phone && (
                    <p className="text-sm text-muted-foreground">{proforma.customers.phone}</p>
                  )}
                  {proforma.customers.address && (
                    <p className="text-sm text-muted-foreground">{proforma.customers.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          {proforma.proforma_items && proforma.proforma_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Tax Amount</TableHead>
                      <TableHead>Batch No</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proforma.proforma_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>{item.tax_percentage}%</TableCell>
                        <TableCell>${item.tax_amount.toFixed(2)}</TableCell>
                        <TableCell>{item.batch_no || '-'}</TableCell>
                        <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-right">${item.line_total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm">${proforma.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tax:</span>
                    <span className="text-sm">${proforma.tax_amount?.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${proforma.total_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
            terms={proforma.terms_and_conditions}
            notes={proforma.notes}
          />
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            {proforma.status !== 'converted' && (
              <Button
                onClick={handleCreateInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Convert to Invoice
              </Button>
            )}
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Proforma Invoice</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete proforma invoice {proforma.proforma_number}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction
          onClick={handleDeleteConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={deleteProforma.isPending}
        >
          {deleteProforma.isPending ? 'Deleting...' : 'Delete'}
        </AlertDialogAction>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
