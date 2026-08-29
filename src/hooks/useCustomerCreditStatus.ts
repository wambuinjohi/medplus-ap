import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerCreditStatus {
  credit_limit: number;
  total_outstanding: number;
  available_credit: number;
  utilization_percent: number;
  allow_credit_beyond_limit: boolean;
}

export function useCustomerCreditStatus(customerId?: string, companyId?: string) {
  return useQuery({
    queryKey: ['customer-credit-status', customerId, companyId],
    queryFn: async (): Promise<CustomerCreditStatus> => {
      if (!customerId || !companyId) {
        return {
          credit_limit: 0,
          total_outstanding: 0,
          available_credit: 0,
          utilization_percent: 0,
          allow_credit_beyond_limit: false,
        };
      }

      // Fetch customer credit limit and override flag
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('credit_limit, allow_credit_beyond_limit')
        .eq('id', customerId)
        .eq('company_id', companyId)
        .single();

      if (customerError) throw customerError;

      const creditLimit = customer.credit_limit || 0;
      const allowCreditBeyond = customer.allow_credit_beyond_limit || false;

      // Fetch outstanding invoices (non-cancelled, with balance due)
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('balance_due')
        .eq('customer_id', customerId)
        .eq('company_id', companyId)
        .neq('status', 'cancelled')
        .gt('balance_due', 0);

      if (invoiceError) throw invoiceError;

      const totalOutstanding = (invoices || []).reduce(
        (sum, inv) => sum + (inv.balance_due || 0),
        0
      );

      const availableCredit = creditLimit - totalOutstanding;
      const utilizationPercent = creditLimit > 0
        ? (totalOutstanding / creditLimit) * 100
        : 0;

      return {
        credit_limit: creditLimit,
        total_outstanding: totalOutstanding,
        available_credit: availableCredit,
        utilization_percent: utilizationPercent,
        allow_credit_beyond_limit: allowCreditBeyond,
      };
    },
    enabled: !!customerId && !!companyId,
  });
}
