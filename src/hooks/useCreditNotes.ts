import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreditNote {
  id: string;
  company_id: string;
  customer_id: string;
  invoice_id?: string;
  credit_note_number: string;
  credit_note_date: string;
  status: 'draft' | 'sent' | 'applied' | 'cancelled';
  reason?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  applied_amount: number;
  balance: number;
  affects_inventory: boolean;
  notes?: string;
  terms_and_conditions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    email?: string;
    phone?: string;
    customer_code: string;
  };
  credit_note_items?: CreditNoteItem[];
  invoices?: {
    invoice_number: string;
    total_amount: number;
  };
}

export interface CreditNoteItem {
  id: string;
  credit_note_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  tax_amount: number;
  tax_inclusive: boolean;
  tax_setting_id?: string;
  line_total: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    product_code: string;
    unit_of_measure: string;
  };
}

export interface CreditNoteAllocation {
  id: string;
  credit_note_id: string;
  invoice_id: string;
  allocated_amount: number;
  allocation_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

// Fetch all credit notes for a company
export function useCreditNotes(companyId: string | undefined) {
  return useQuery({
    queryKey: ['creditNotes', companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID is required');

      const { data, error } = await supabase
        .from('credit_notes')
        .select(`
          *,
          customers!customer_id (
            name,
            email,
            phone,
            customer_code
          ),
          credit_note_items (
            *,
            products!product_id (
              name,
              product_code,
              unit_of_measure
            )
          ),
          invoices!invoice_id (
            invoice_number,
            total_amount
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditNote[];
    },
    enabled: !!companyId,
  });
}

// Fetch credit notes for a specific customer
export function useCustomerCreditNotes(customerId: string | undefined, companyId: string | undefined) {
  return useQuery({
    queryKey: ['customerCreditNotes', customerId, companyId],
    queryFn: async () => {
      if (!customerId || !companyId) throw new Error('Customer ID and Company ID are required');

      const { data, error } = await supabase
        .from('credit_notes')
        .select(`
          *,
          customers!customer_id (
            name,
            email,
            phone,
            customer_code
          ),
          credit_note_items (
            *,
            products!product_id (
              name,
              product_code,
              unit_of_measure
            )
          )
        `)
        .eq('customer_id', customerId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditNote[];
    },
    enabled: !!customerId && !!companyId,
  });
}

// Fetch a single credit note by ID
export function useCreditNote(creditNoteId: string | undefined) {
  return useQuery({
    queryKey: ['creditNote', creditNoteId],
    queryFn: async () => {
      if (!creditNoteId) throw new Error('Credit Note ID is required');

      const { data, error } = await supabase
        .from('credit_notes')
        .select(`
          *,
          customers!customer_id (
            name,
            email,
            phone,
            customer_code
          ),
          credit_note_items (
            *,
            products!product_id (
              name,
              product_code,
              unit_of_measure
            )
          ),
          invoices!invoice_id (
            invoice_number,
            total_amount
          )
        `)
        .eq('id', creditNoteId)
        .single();

      if (error) throw error;
      return data as CreditNote;
    },
    enabled: !!creditNoteId,
  });
}

// Create a new credit note
export function useCreateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creditNote: Omit<CreditNote, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('credit_notes')
        .insert(creditNote)
        .select()
        .single();

      if (error) throw error;
      return data as CreditNote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNotes'] });
      toast.success(`Credit note ${data.credit_note_number} created successfully!`);
    },
    onError: (error: any) => {
      console.error('Error creating credit note:', error);
      toast.error('Failed to create credit note. Please try again.');
    },
  });
}

// Update an existing credit note
export function useUpdateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreditNote> }) => {
      const { data, error } = await supabase
        .from('credit_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CreditNote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['creditNote', data.id] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNotes'] });
      toast.success(`Credit note ${data.credit_note_number} updated successfully!`);
    },
    onError: (error: any) => {
      console.error('Error updating credit note:', error);
      toast.error('Failed to update credit note. Please try again.');
    },
  });
}

// Delete a credit note
export function useDeleteCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('delete_credit_note_atomic', {
        credit_note_uuid: id,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to delete credit note');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['creditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['statementCreditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      toast.success('Credit note deleted successfully! All related records have been updated.');
    },
    onError: (error: any) => {
      console.error('Error deleting credit note:', error);
      const errorMessage =
        error.message || 'Failed to delete credit note. Please try again.';
      toast.error(errorMessage);
    },
  });
}

// Generate credit note number
export function useGenerateCreditNoteNumber() {
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data, error } = await supabase
        .rpc('generate_credit_note_number', { company_uuid: companyId });

      if (error) throw error;
      return data as string;
    },
    onError: (error: any) => {
      console.error('Error generating credit note number:', error);
      toast.error('Failed to generate credit note number. Please try again.');
    },
  });
}

// Fetch credit note allocations
export function useCreditNoteAllocations(creditNoteId: string | undefined) {
  return useQuery({
    queryKey: ['creditNoteAllocations', creditNoteId],
    queryFn: async () => {
      if (!creditNoteId) throw new Error('Credit Note ID is required');

      const { data, error } = await supabase
        .from('credit_note_allocations')
        .select(`
          *,
          invoices!invoice_id (
            invoice_number,
            total_amount,
            balance_due
          )
        `)
        .eq('credit_note_id', creditNoteId)
        .order('allocation_date', { ascending: false });

      if (error) throw error;
      return data as (CreditNoteAllocation & {
        invoices: {
          invoice_number: string;
          total_amount: number;
          balance_due: number;
        };
      })[];
    },
    enabled: !!creditNoteId,
  });
}

// Apply credit note to invoice
export function useApplyCreditNoteToInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      creditNoteId,
      invoiceId,
      amount,
      appliedBy
    }: {
      creditNoteId: string;
      invoiceId: string;
      amount: number;
      appliedBy: string;
    }) => {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        throw new Error('Your session has expired. Sign in again before applying a credit note.');
      }

      if (!creditNoteId || !invoiceId || !appliedBy) {
        throw new Error('Missing required fields: creditNoteId, invoiceId, appliedBy');
      }

      if (appliedBy !== currentUser.id) {
        throw new Error('The authenticated user changed. Please reopen the credit note and try again.');
      }

      if (amount <= 0) {
        throw new Error('Amount to apply must be greater than zero');
      }

      // Step 1: Fetch credit note to validate available balance
      const { data: creditNote, error: cnFetchError } = await supabase
        .from('credit_notes')
        .select('balance, total_amount, applied_amount')
        .eq('id', creditNoteId)
        .single();

      if (cnFetchError) {
        throw new Error(`Unable to load credit note: ${cnFetchError.message}`);
      }
      if (!creditNote) {
        throw new Error('Credit note not found');
      }

      if (amount > creditNote.balance) {
        throw new Error(
          `Amount to apply (${amount}) exceeds available balance (${creditNote.balance}). ` +
          `Total amount: ${creditNote.total_amount}, Already applied: ${creditNote.applied_amount}`
        );
      }

      // Step 2: Fetch invoice to validate it exists and check balance
      const { data: invoice, error: invFetchError } = await supabase
        .from('invoices')
        .select('balance_due, total_amount')
        .eq('id', invoiceId)
        .single();

      if (invFetchError) {
        throw new Error(`Unable to load invoice: ${invFetchError.message}`);
      }
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (amount > invoice.balance_due) {
        throw new Error(
          `Amount to apply (${amount}) exceeds invoice balance due (${invoice.balance_due})`
        );
      }

      // Step 3: Call the RPC function to create the allocation
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('apply_credit_note_to_invoice', {
          credit_note_uuid: creditNoteId,
          invoice_uuid: invoiceId,
          amount_to_apply: amount,
          applied_by_uuid: currentUser.id
        });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw new Error(`Credit note application failed: ${rpcError.message}`);
      }

      let resultObj: { success?: boolean; error?: string; [key: string]: unknown };
      try {
        resultObj = typeof rpcResult === 'string' ? JSON.parse(rpcResult) : rpcResult;
      } catch {
        throw new Error('Credit note application returned an invalid response. Verify the deployed database function.');
      }
      if (!resultObj?.success) {
        throw new Error(resultObj?.error || 'RPC function returned failure');
      }

      return resultObj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['creditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['statementCreditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNoteAllocations'] });
    },
  });
}

// Unapply credit note allocation from invoice
export function useUnapplyCreditNoteAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ allocationId }: {
      allocationId: string;
      creditNoteId: string;
      invoiceId: string;
      allocatedAmount: number;
    }) => {
      const { data, error } = await supabase.rpc('unapply_credit_note_allocation', {
        allocation_uuid: allocationId,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to reverse allocation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['creditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['statementCreditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['customerCreditNoteAllocations'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      toast.success('Allocation reversed successfully!');
    },
    onError: (error: any) => {
      console.error('Error unapplying credit note:', error);
      const errorMessage = error.message || 'Failed to reverse allocation';
      toast.error(errorMessage);
    },
  });
}
