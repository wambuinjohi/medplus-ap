import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useCompanies } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_TERMS_EXPORT } from '@/utils/termsManager';

export function TermsAndConditionsSettings() {
  const { data: companies } = useCompanies();
  const { profile } = useAuth();
  const currentCompany = companies?.[0];

  const [terms, setTerms] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalTerms, setOriginalTerms] = useState('');

  // Fetch terms from database
  useEffect(() => {
    const fetchTerms = async () => {
      if (!currentCompany?.id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('company_settings')
          .select('terms_and_conditions')
          .eq('company_id', currentCompany.id)
          .single();

        if (error) {
          console.warn('Error fetching terms:', error);
          setTerms(DEFAULT_TERMS_EXPORT);
          setOriginalTerms(DEFAULT_TERMS_EXPORT);
        } else {
          const fetchedTerms = data?.terms_and_conditions || DEFAULT_TERMS_EXPORT;
          setTerms(fetchedTerms);
          setOriginalTerms(fetchedTerms);
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
        setTerms(DEFAULT_TERMS_EXPORT);
        setOriginalTerms(DEFAULT_TERMS_EXPORT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [currentCompany?.id]);

  const handleTermsChange = (value: string) => {
    setTerms(value);
    setHasChanges(value !== originalTerms);
  };

  const handleSave = async () => {
    if (!currentCompany?.id || !profile?.id) {
      toast.error('Company or user information not available');
      return;
    }

    if (!terms.trim()) {
      toast.error('Terms and conditions cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert(
          {
            company_id: currentCompany.id,
            terms_and_conditions: terms,
            updated_by: profile.id,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'company_id',
          }
        );

      if (error) {
        throw error;
      }

      setOriginalTerms(terms);
      setHasChanges(false);
      toast.success('Terms and conditions updated successfully!');
      
      // Refresh the page to apply changes to PDFs
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save terms';
      toast.error(`Error: ${errorMessage}`);
      console.error('Error saving terms:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default terms?')) {
      setTerms(DEFAULT_TERMS_EXPORT);
      setHasChanges(DEFAULT_TERMS_EXPORT !== originalTerms);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
        <p className="text-muted-foreground mt-2">
          Manage the default terms and conditions for your company. These will be applied to all quotations, invoices, proformas, and other documents.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes to terms and conditions will apply to all new documents. Existing documents will keep their original terms.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions Text</CardTitle>
          <CardDescription>
            Edit the default terms that will appear on all your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="terms" className="text-sm font-medium">
              Terms & Conditions Content
            </label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => handleTermsChange(e.target.value)}
              placeholder="Enter your terms and conditions..."
              className="min-h-96 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Total characters: {terms.length}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Terms
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>
            This is how your terms will appear on documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded border border-blue-100 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm">
            {terms}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
