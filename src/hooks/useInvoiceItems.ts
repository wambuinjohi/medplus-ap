import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  tax_amount: number;
  tax_inclusive: boolean;
  line_total: number;
}

export function useInvoiceItems(invoiceId?: string) {
  return useQuery({
    queryKey: ['invoice-items', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];

      const { data, error } = await supabase
        .from('invoice_items')
        .select('id, product_id, description, quantity, unit_price, tax_percentage, tax_amount, tax_inclusive, line_total')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Fetch product names
      if (!data || data.length === 0) return [];

      const productIds = data.map(item => item.product_id).filter(Boolean);
      const productsData = productIds.length > 0
        ? await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds)
        : { data: [] };

      const productMap = (productsData.data || []).reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
      }, {} as Record<string, string>);

      return data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: productMap[item.product_id] || 'Unknown Product',
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_percentage: item.tax_percentage,
        tax_amount: item.tax_amount,
        tax_inclusive: item.tax_inclusive,
        line_total: item.line_total,
      })) as InvoiceItem[];
    },
    enabled: !!invoiceId,
  });
}
