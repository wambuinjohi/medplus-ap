import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  invoice_number: string;
  balance_due: number;
  issued_date: string;
  customer_id: string;
}

export function useCustomerInvoices(customerId?: string, companyId?: string) {
  return useQuery({
    queryKey: ['customer-invoices', customerId, companyId],
    queryFn: async () => {
      if (!customerId || !companyId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, balance_due, issued_date, customer_id')
        .eq('customer_id', customerId)
        .eq('company_id', companyId)
        .neq('status', 'cancelled')
        .gt('balance_due', 0)
        .order('issued_date', { ascending: false });

      if (error) throw error;
      return (data as Invoice[]) || [];
    },
    enabled: !!customerId && !!companyId,
  });
}
