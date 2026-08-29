import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateCreditNotePDF, type CreditNotePDFData, type CompanyData } from '@/utils/creditNotePdfGenerator';
import { useCompanies } from '@/hooks/useDatabase';
import { applyTermsToCreditNoteForPDF } from '@/utils/pdfTermsManager';

export function useCreditNotePDFDownload() {
  const { data: companies } = useCompanies();
  const currentCompany = companies?.[0];

  return useMutation({
    mutationFn: async (creditNote: CreditNotePDFData) => {
      // Fetch credit note allocations with full invoice details if not already included
      if (!creditNote.credit_note_allocations) {
        try {
          const { data: allocations, error } = await supabase
            .from('credit_note_allocations')
            .select(`
              *,
              invoices!invoice_id (
                id,
                invoice_number,
                invoice_date,
                subtotal,
                tax_amount,
                total_amount,
                balance_due,
                invoice_items (
                  id,
                  description,
                  quantity,
                  unit_price,
                  tax_percentage,
                  tax_amount,
                  line_total
                )
              )
            `)
            .eq('credit_note_id', creditNote.id)
            .order('allocation_date', { ascending: false });

          if (!error && allocations) {
            creditNote.credit_note_allocations = allocations;
          }
        } catch (err) {
          console.warn('Failed to fetch credit note allocations:', err);
        }
      }

      // Fetch directly linked invoice details if not already included
      if (creditNote.invoice_id && !creditNote.invoices) {
        try {
          const { data: invoice, error } = await supabase
            .from('invoices')
            .select(`
              id,
              invoice_number,
              invoice_date,
              subtotal,
              tax_amount,
              total_amount,
              balance_due,
              invoice_items (
                id,
                description,
                quantity,
                unit_price,
                tax_percentage,
                tax_amount,
                line_total
              )
            `)
            .eq('id', creditNote.invoice_id)
            .single();

          if (!error && invoice) {
            creditNote.invoices = invoice as any;
          }
        } catch (err) {
          console.warn('Failed to fetch related invoice details:', err);
        }
      }

      // Prepare company data
      const companyData: CompanyData = {
        name: currentCompany?.name || 'Your Company',
        email: currentCompany?.email || '',
        phone: currentCompany?.phone || '',
        address: currentCompany?.address || '',
        tax_number: currentCompany?.tax_number || '',
        registration_number: currentCompany?.registration_number || '',
        logo_url: currentCompany?.logo_url || '',
      };

      // Apply dynamic company terms before generating PDF
      const creditNoteWithTerms = await applyTermsToCreditNoteForPDF(
        creditNote,
        currentCompany?.id
      );

      // Generate and download PDF
      generateCreditNotePDF(creditNoteWithTerms, companyData);

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Credit note PDF downloaded successfully!');
    },
    onError: (error: any) => {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    },
  });
}
