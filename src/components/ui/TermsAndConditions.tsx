import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TermsAndConditionsProps {
  terms?: string | null;
  notes?: string | null;
  variant?: 'view' | 'compact';
}

export function TermsAndConditions({
  terms,
  notes,
  variant = 'view'
}: TermsAndConditionsProps) {
  if (!terms && !notes) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {notes && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded">
              {notes}
            </p>
          </div>
        )}
        {terms && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded">
              {terms}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default view variant - use Cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
          </CardContent>
        </Card>
      )}

      {terms && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Terms & Conditions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{terms}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
