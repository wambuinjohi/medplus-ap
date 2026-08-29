import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { setTestTerms, getTestTerms, resetToDefaultAfterTest, PDF_FUNCTIONS_TO_TEST, logVerificationChecklist } from '@/utils/termsVerification';

export function TermsVerificationPanel() {
  const [testTerms, setTestTermsState] = useState('');
  const [currentTerms, setCurrentTerms] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const loadCurrentTerms = () => {
    const terms = getTestTerms();
    setCurrentTerms(terms);
  };

  const handleSetTestTerms = () => {
    const customTerms = `VERIFICATION TEST - Custom Terms v${new Date().getTime()}

Please verify that this exact text appears in all downloaded PDFs.

1. Quotations
2. Invoices  
3. Proforma Invoices
4. Delivery Notes
5. LPOs
6. Remittance Advice
7. Customer Statements
8. Payment Receipts

If you see this text in a PDF, that document type is using dynamic terms. ✓
If you see old terms instead, that document type is NOT using dynamic terms. ✗`;

    setTestTerms(customTerms);
    setTestTermsState(customTerms);
    setTestTerms(customTerms);
    setCurrentTerms(customTerms);
    toast.success('Test terms set! Download PDFs to verify they use the new terms.');
  };

  const handleReset = () => {
    resetToDefaultAfterTest();
    setTestTermsState('');
    loadCurrentTerms();
    toast.success('Terms reset to default');
  };

  const handleLogChecklist = () => {
    logVerificationChecklist();
    toast.success('Verification checklist logged to browser console');
  };

  const handleCopyTerms = () => {
    navigator.clipboard.writeText(currentTerms);
    toast.success('Terms copied to clipboard');
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Dynamic Terms Verification
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <Alert className="bg-white border-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This panel helps verify that all PDF documents use the dynamic terms from Settings.
              Follow the steps below to test each document type.
            </AlertDescription>
          </Alert>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm font-semibold mb-2">PDF Functions Being Tested</div>
                <Badge variant="outline" className="text-xs">
                  {PDF_FUNCTIONS_TO_TEST.length} functions
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm font-semibold mb-2">Test Status</div>
                <Badge className="bg-green-100 text-green-800">Ready</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Test Terms Display */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Current Terms in Storage:</label>
            <div className="relative">
              <Textarea
                value={currentTerms}
                readOnly
                className="min-h-[100px] text-xs font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopyTerms}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="text-sm font-semibold mb-2">Verification Steps:</div>
            
            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSetTestTerms}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                1. Set Unique Test Terms
              </Button>
              <p className="text-xs text-gray-600 ml-2">
                Sets distinctive test terms that make it easy to verify which documents are using dynamic terms
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="text-sm font-semibold">2. Download PDFs and Verify:</div>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                <li>✓ Create a Quotation → Download PDF → Check for test terms</li>
                <li>✓ Create an Invoice → Download PDF → Check for test terms</li>
                <li>✓ Create a Proforma → Download PDF → Check for test terms</li>
                <li>✓ Create a Delivery Note → Download PDF → Check for test terms</li>
                <li>✓ Create an LPO → Download PDF → Check for test terms</li>
                <li>✓ Create a Remittance → Download PDF → Check for test terms</li>
                <li>✓ Generate a Statement → Download PDF → Check for test terms</li>
                <li>✓ Record a Payment → Download Receipt PDF → Check for test terms</li>
              </ul>
            </div>

            <div className="space-y-2 mt-4">
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleLogChecklist}
              >
                3. View Full Checklist (Console)
              </Button>
              <p className="text-xs text-gray-600 ml-2">
                Logs the complete verification checklist to browser console (F12)
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={loadCurrentTerms}
              >
                Refresh Current Terms
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleReset}
              >
                4. Reset to Default Terms
              </Button>
              <p className="text-xs text-gray-600 ml-2">
                Resets terms to the original default after testing is complete
              </p>
            </div>
          </div>

          {/* Expected Results */}
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              <strong>Expected Result:</strong> All 8 PDF document types should display the test terms.
              This confirms they're using the dynamic terms from Settings.
            </AlertDescription>
          </Alert>

          {/* Functions Being Tested */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">PDF Functions Being Tested:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {PDF_FUNCTIONS_TO_TEST.map((func, index) => (
                <div key={index} className="text-xs p-2 bg-white rounded border border-gray-200">
                  <div className="font-mono text-blue-600">{func.name}</div>
                  <div className="text-gray-600">{func.type}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
