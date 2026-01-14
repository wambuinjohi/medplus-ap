import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTermsAndConditions as getFallbackTerms } from '@/utils/termsManager';

interface CompanySettings {
  id: string;
  company_id: string;
  terms_and_conditions: string;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Fetch company-specific terms and conditions from database
 * Falls back to localStorage/default terms if not found
 */
export const useCompanyTerms = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['company-terms', companyId],
    queryFn: async () => {
      if (!companyId) {
        return getFallbackTerms();
      }

      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('terms_and_conditions')
          .eq('company_id', companyId)
          .single();

        if (error) {
          console.warn('Error fetching company terms:', error);
          return getFallbackTerms();
        }

        return data?.terms_and_conditions || getFallbackTerms();
      } catch (error) {
        console.error('Unexpected error fetching company terms:', error);
        return getFallbackTerms();
      }
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Update company terms in database
 */
export const useUpdateCompanyTerms = () => {
  return {
    mutateAsync: async (companyId: string, terms: string, userId: string) => {
      const { data, error } = await supabase
        .from('company_settings')
        .upsert(
          {
            company_id: companyId,
            terms_and_conditions: terms,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'company_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update terms: ${error.message}`);
      }

      return data as CompanySettings;
    },
  };
};
