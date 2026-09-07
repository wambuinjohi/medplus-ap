import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  invoice_number: string;
  balance_due: number;
  total_amount: number;
  invoice_date: string;
  customer_id: string;
}

export function useCustomerInvoices(customerId?: string, companyId?: string) {
  return useQuery({
    queryKey: ['customer-invoices', customerId, companyId],
    queryFn: async ({ signal }) => {
      if (!customerId || !companyId) return [];

      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('id, invoice_number, total_amount, balance_due, invoice_date, customer_id')
          .eq('customer_id', customerId)
          .eq('company_id', companyId)
          .neq('status', 'cancelled')
          .gt('balance_due', 0)
          .order('invoice_date', { ascending: false })
          .abortSignal(signal);

        if (error) {
          console.error('Error fetching customer invoices:', error);
          throw error;
        }
        return (data as Invoice[]) || [];
      } catch (err) {
        console.error('Exception fetching customer invoices:', err);
        throw err;
      }
    },
    enabled: !!customerId && !!companyId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
