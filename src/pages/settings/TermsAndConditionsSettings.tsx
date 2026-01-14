import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, RotateCcw, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getTermsAndConditions, setTermsAndConditions, resetTermsToDefault, DEFAULT_TERMS_EXPORT } from '@/utils/termsManager';

export default function TermsAndConditionsSettings() {
  const [terms, setTerms] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTerms(DEFAULT_TERMS);
        return;
      }

      // Try to load saved terms from a custom metadata or settings
      // For now, we'll use localStorage as a fallback
      const savedTerms = localStorage.getItem('default_terms_and_conditions');
      if (savedTerms) {
        setTerms(savedTerms);
      } else {
        setTerms(DEFAULT_TERMS);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      setTerms(DEFAULT_TERMS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to save settings');
        return;
      }

      // Save to localStorage
      localStorage.setItem('default_terms_and_conditions', terms);
      
      // Optionally, you could also save to a settings table if you create one
      // For now, localStorage is sufficient for client-side persistence
      
      setHasChanges(false);
      toast.success('Terms & Conditions saved successfully');
    } catch (error) {
      console.error('Error saving terms:', error);
      toast.error('Failed to save Terms & Conditions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default terms?')) {
      setTerms(DEFAULT_TERMS);
      setHasChanges(true);
    }
  };

  const handleCopyDefault = () => {
    setTerms(DEFAULT_TERMS);
    setHasChanges(true);
    toast.info('Default terms copied. Click Save to apply changes.');
  };

  const handleChange = (newTerms: string) => {
    setTerms(newTerms);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading Terms & Conditions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      </div>

      <p className="text-muted-foreground">
        Manage default terms and conditions that will be automatically applied to quotations, invoices, proforma invoices, and other documents.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms">Terms & Conditions Text</Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Enter your terms and conditions..."
                  className="mt-2 min-h-[400px] font-mono text-sm"
                />
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto border rounded p-3 bg-muted/50">
                {terms}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                onClick={handleCopyDefault}
                className="w-full justify-start"
              >
                <Copy className="h-4 w-4 mr-2" />
                Load Default Terms
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Where Used</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50">Quotations</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50">Invoices</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50">Proforma Invoices</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50">Credit Notes</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-50">LPOs</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: Document-specific terms will override these defaults.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
              <div>
                <strong>Use clear sections:</strong> Organize terms with numbered items for better readability.
              </div>
              <div>
                <strong>Be specific:</strong> Include payment terms, return policies, and liability clauses.
              </div>
              <div>
                <strong>Professional tone:</strong> Keep the language formal and professional.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
