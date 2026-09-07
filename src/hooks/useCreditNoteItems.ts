import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CreditNote, CreditNoteItem } from './useCreditNotes';

interface CreateCreditNoteWithItemsData {
  creditNote: Omit<CreditNote, 'id' | 'created_at' | 'updated_at' | 'customers' | 'credit_note_items' | 'invoices'>;
  items: Omit<CreditNoteItem, 'id' | 'credit_note_id' | 'created_at' | 'updated_at' | 'products'>[];
}

interface UpdateCreditNoteWithItemsData {
  creditNoteId: string;
  creditNote: Partial<CreditNote>;
  items: Omit<CreditNoteItem, 'id' | 'credit_note_id' | 'created_at' | 'updated_at' | 'products'>[];
}

// Create credit note with items (transactional)
export function useCreateCreditNoteWithItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creditNote, items }: CreateCreditNoteWithItemsData) => {
      console.log('Creating credit note with items:', { creditNote, items });

      // Start transaction-like operations
      try {
        // Ensure created_by defaults to the authenticated user
        const cleanCreditNote = { ...creditNote } as any;
        try {
          const { data: userData } = await supabase.auth.getUser();
          const authUserId = userData?.user?.id || null;
          if (authUserId) {
            cleanCreditNote.created_by = authUserId;
          } else if (typeof cleanCreditNote.created_by === 'undefined' || cleanCreditNote.created_by === null) {
            cleanCreditNote.created_by = null;
          }
        } catch {
          if (typeof cleanCreditNote.created_by === 'undefined') {
            cleanCreditNote.created_by = null;
          }
        }

        // 1. Create the credit note
        let createdCreditNote; let creditNoteError: any;
        {
          const { data, error } = await supabase
            .from('credit_notes')
            .insert(cleanCreditNote)
            .select()
            .single();
          createdCreditNote = data; creditNoteError = error as any;
        }
        if (creditNoteError && creditNoteError.code === '23503' && String(creditNoteError.message || '').includes('created_by')) {
          const retryPayload = { ...cleanCreditNote, created_by: null };
          const retryRes = await supabase
            .from('credit_notes')
            .insert(retryPayload)
            .select()
            .single();
          createdCreditNote = retryRes.data; creditNoteError = retryRes.error as any;
        }

        if (creditNoteError) {
          console.error('Error creating credit note:', {
            message: creditNoteError.message,
            code: creditNoteError.code,
            details: creditNoteError.details,
            hint: creditNoteError.hint
          });

          // Check for RLS/permission errors
          if (creditNoteError.code === '42501' || creditNoteError.code === 'PGRST301' ||
              creditNoteError.message?.includes('permission') ||
              creditNoteError.message?.includes('policy')) {
            console.error('RLS Policy Error - User may lack required permissions');
            throw new Error(`Permission denied: You don't have permission to create credit notes. Please contact your administrator.`);
          }

          throw creditNoteError;
        }

        console.log('Credit note created:', createdCreditNote);

        // 2. Create credit note items
        if (items.length > 0) {
          const itemsToInsert = items.map((item, index) => ({
            ...item,
            credit_note_id: createdCreditNote.id,
            sort_order: index
          }));

          const { error: itemsError } = await supabase
            .from('credit_note_items')
            .insert(itemsToInsert);

          if (itemsError) {
            console.error('Error creating credit note items:', {
              message: itemsError.message,
              code: itemsError.code,
              details: itemsError.details,
              hint: itemsError.hint
            });

            // Check for RLS/permission errors
            if (itemsError.code === '42501' || itemsError.code === 'PGRST301' ||
                itemsError.message?.includes('permission') ||
                itemsError.message?.includes('policy')) {
              console.error('RLS Policy Error on items - User may lack required permissions');
              // Still try to cleanup the credit note
              await supabase
                .from('credit_notes')
                .delete()
                .eq('id', createdCreditNote.id)
                .catch(err => console.error('Cleanup error:', err));
              throw new Error(`Permission denied: You don't have permission to add credit note items. Please contact your administrator.`);
            }

            // Cleanup: delete the credit note if items failed
            await supabase
              .from('credit_notes')
              .delete()
              .eq('id', createdCreditNote.id);
            throw itemsError;
          }

          console.log('Credit note items created successfully');
        }

        // Inventory is adjusted atomically when the note is applied to an invoice.

        return createdCreditNote;
      } catch (error) {
        console.error('Error in credit note creation transaction:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh products for stock updates
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast.success(`Credit note ${data.credit_note_number} created successfully!`);
    },
    onError: (error: any) => {
      console.error('Error creating credit note with items:', error);
      let errorMessage = 'Failed to create credit note';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details) {
        errorMessage = error.details;
      }
      
      toast.error(errorMessage);
    },
  });
}

// Update credit note with items (transactional)
export function useUpdateCreditNoteWithItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creditNoteId, creditNote, items }: UpdateCreditNoteWithItemsData) => {
      console.log('Updating credit note with items:', { creditNoteId, creditNote, items });

      try {
        // 1. Get existing credit note to check if it affects inventory
        const { data: existingCreditNote, error: fetchError } = await supabase
          .from('credit_notes')
          .select('affects_inventory, credit_note_number')
          .eq('id', creditNoteId)
          .single();

        if (fetchError) throw fetchError;

        // Draft edits do not affect inventory; stock is reconciled on application.

        // 3. Update the credit note
        const { data: updatedCreditNote, error: updateError } = await supabase
          .from('credit_notes')
          .update(creditNote)
          .eq('id', creditNoteId)
          .select()
          .single();

        if (updateError) throw updateError;

        // 4. Delete existing credit note items
        const { error: deleteItemsError } = await supabase
          .from('credit_note_items')
          .delete()
          .eq('credit_note_id', creditNoteId);

        if (deleteItemsError) throw deleteItemsError;

        // 5. Insert new credit note items
        if (items.length > 0) {
          const itemsToInsert = items.map((item, index) => ({
            ...item,
            credit_note_id: creditNoteId,
            sort_order: index
          }));

          const { error: itemsError } = await supabase
            .from('credit_note_items')
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }

        // Inventory remains unchanged until this note is applied.

        return updatedCreditNote;
      } catch (error) {
        console.error('Error in credit note update transaction:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['creditNote', data.id] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast.success(`Credit note ${data.credit_note_number} updated successfully!`);
    },
    onError: (error: any) => {
      console.error('Error updating credit note with items:', error);
      let errorMessage = 'Failed to update credit note';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details) {
        errorMessage = error.details;
      }
      
      toast.error(errorMessage);
    },
  });
}

// Convert invoice to credit note
export function useConvertInvoiceToCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      reason,
      affectsInventory = false,
      itemsToCredit
    }: {
      invoiceId: string;
      reason?: string;
      affectsInventory?: boolean;
      itemsToCredit?: { itemId: string; quantity: number }[]; // Partial credit note
    }) => {
      console.log('Converting invoice to credit note:', { invoiceId, reason, affectsInventory, itemsToCredit });

      // 1. Fetch the invoice with items
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (*),
          invoice_items (
            *,
            products (*)
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Generate credit note number
      const { data: creditNoteNumber, error: numberError } = await supabase
        .rpc('generate_credit_note_number', { company_uuid: invoice.company_id });

      if (numberError) throw numberError;

      // 3. Determine which items to credit
      let itemsToProcess = invoice.invoice_items;
      if (itemsToCredit && itemsToCredit.length > 0) {
        itemsToProcess = invoice.invoice_items
          .filter(item => itemsToCredit.some(credit => credit.itemId === item.id))
          .map(item => {
            const creditInfo = itemsToCredit.find(credit => credit.itemId === item.id);
            return {
              ...item,
              quantity: creditInfo ? creditInfo.quantity : item.quantity
            };
          });
      }

      // 4. Calculate totals
      const subtotal = itemsToProcess.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const taxAmount = itemsToProcess.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
      const totalAmount = itemsToProcess.reduce((sum, item) => sum + item.line_total, 0);

      // 5. Create the credit note
      // Determine creator (prefer invoice.created_by, fall back to current auth user)
      let createdBy: string | null = invoice.created_by || null;
      if (!createdBy) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          createdBy = userData?.user?.id || null;
        } catch {
          createdBy = null;
        }
      }

      const creditNoteData = {
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        invoice_id: invoice.id,
        credit_note_number: creditNoteNumber,
        credit_note_date: new Date().toISOString().split('T')[0],
        status: 'draft' as const,
        reason: reason || 'Invoice conversion',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        applied_amount: 0,
        balance: totalAmount,
        affects_inventory: affectsInventory,
        notes: `Created from Invoice ${invoice.invoice_number}`,
        terms_and_conditions: invoice.terms_and_conditions,
        created_by: createdBy
      };

      const creditNoteItems = itemsToProcess.map(item => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_percentage: item.tax_percentage || 0,
        tax_amount: item.tax_amount || 0,
        tax_inclusive: item.tax_inclusive || false,
        tax_setting_id: item.tax_setting_id,
        line_total: item.line_total,
        sort_order: 0
      }));

      // Use the create with items hook
      return { creditNote: creditNoteData, items: creditNoteItems };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice converted to credit note successfully!');
    },
    onError: (error: any) => {
      console.error('Error converting invoice to credit note:', error);
      toast.error('Failed to convert invoice to credit note');
    },
  });
}
