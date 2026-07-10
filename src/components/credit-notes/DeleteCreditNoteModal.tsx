import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { CreditNote, CreditNoteAllocation } from '@/hooks/useCreditNotes';

interface DeleteCreditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote: CreditNote | null;
  isDeleting?: boolean;
  onConfirm: (creditNoteId: string) => Promise<void>;
}

interface AllocatedInvoice {
  invoice_id: string;
  invoice_number: string;
  allocated_amount: number;
}

export function DeleteCreditNoteModal({
  open,
  onOpenChange,
  creditNote,
  isDeleting = false,
  onConfirm,
}: DeleteCreditNoteModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [allocatedInvoices, setAllocatedInvoices] = useState<AllocatedInvoice[]>([]);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);

  useEffect(() => {
    if (open && creditNote) {
      loadAllocatedInvoices();
    }
  }, [open, creditNote]);

  const loadAllocatedInvoices = async () => {
    if (!creditNote) return;

    setIsLoadingAllocations(true);
    try {
      const { data, error } = await supabase
        .from('credit_note_allocations')
        .select(`
          id,
          credit_note_id,
          invoice_id,
          allocated_amount,
          invoices!invoice_id (
            invoice_number
          )
        `)
        .eq('credit_note_id', creditNote.id);

      if (error) {
        console.warn('Failed to load allocations:', error);
        setAllocatedInvoices([]);
      } else if (data) {
        const invoices: AllocatedInvoice[] = (data as any[]).map((alloc: any) => ({
          invoice_id: alloc.invoice_id,
          invoice_number: alloc.invoices?.invoice_number || 'Unknown',
          allocated_amount: alloc.allocated_amount,
        }));
        setAllocatedInvoices(invoices);
      }
    } catch (err) {
      console.warn('Error loading allocations:', err);
      setAllocatedInvoices([]);
    } finally {
      setIsLoadingAllocations(false);
    }
  };

  if (!creditNote) return null;

  const hasAllocations = (creditNote.applied_amount || 0) > 0;
  const itemsCount = creditNote.credit_note_items?.length || 0;
  const affectsInventory = creditNote.affects_inventory;

  const handleConfirm = async () => {
    if (confirmed) {
      await onConfirm(creditNote.id);
      setConfirmed(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete Credit Note Entirely</span>
          </DialogTitle>
          <DialogDescription>
            This will permanently delete the credit note and reverse all allocations. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Credit Note Details */}
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Credit Note</p>
                <p className="text-sm text-muted-foreground">{creditNote.credit_note_number}</p>
              </div>
              <Badge variant="outline">{creditNote.status}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{creditNote.customers?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                  }).format(creditNote.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                  }).format(creditNote.balance || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Impact Summary */}
          <Alert className="border-warning-light bg-warning-light/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle>Impact of Deletion</AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              {itemsCount > 0 && (
                <div>• {itemsCount} line item(s) will be deleted</div>
              )}
              {hasAllocations && (
                <div>• {creditNote.applied_amount} allocated amount will be reversed from invoices</div>
              )}
              {affectsInventory && (
                <div>• Inventory movements will be reversed (stock will be adjusted)</div>
              )}
              <div>• A complete audit log will be recorded</div>
            </AlertDescription>
          </Alert>

          {/* Related Records Info */}
          {(hasAllocations || itemsCount > 0 || affectsInventory) && (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Related Records:</p>
              <ul className="space-y-1 text-muted-foreground">
                {itemsCount > 0 && (
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>{itemsCount} line item(s) will be deleted</span>
                  </li>
                )}
                {hasAllocations && (
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>{allocatedInvoices.length} invoice(s) will be affected</span>
                  </li>
                )}
                {affectsInventory && (
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>Stock movement records will be reversed</span>
                  </li>
                )}
              </ul>

              {/* Detailed Allocations List */}
              {allocatedInvoices.length > 0 && (
                <div className="mt-3 space-y-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-semibold text-foreground">Invoices with Allocations:</p>
                  {isLoadingAllocations ? (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading allocations...</span>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {allocatedInvoices.map((inv) => (
                        <li key={inv.invoice_id} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{inv.invoice_number}</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('en-KE', {
                              style: 'currency',
                              currency: 'KES',
                            }).format(inv.allocated_amount || 0)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3 rounded-lg bg-destructive-light/10 p-3">
            <input
              type="checkbox"
              id="confirm-delete"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 accent-destructive"
            />
            <label htmlFor="confirm-delete" className="text-sm font-medium cursor-pointer">
              I understand this action cannot be undone and all related records will be affected
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmed(false);
              onOpenChange(false);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!confirmed || isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
