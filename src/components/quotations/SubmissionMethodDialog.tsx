import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Mail } from 'lucide-react';

interface SubmissionMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWhatsAppSelect: () => void;
  onEmailSelect: () => void;
  isLoading?: boolean;
  productName?: string;
}

export function SubmissionMethodDialog({
  open,
  onOpenChange,
  onWhatsAppSelect,
  onEmailSelect,
  isLoading = false,
  productName
}: SubmissionMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Request Quotation</DialogTitle>
          <DialogDescription>
            {productName ? (
              <span>How would you like to request a quotation for <strong>{productName}</strong>?</span>
            ) : (
              <span>How would you like to submit your quotation request?</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {/* WhatsApp Option */}
          <button
            onClick={onWhatsAppSelect}
            disabled={isLoading}
            className="flex items-center gap-4 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0">
              <MessageCircle size={32} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">WhatsApp</div>
              <div className="text-sm text-gray-600">Quick chat message to our sales team</div>
            </div>
          </button>

          {/* Email Option */}
          <button
            onClick={onEmailSelect}
            disabled={isLoading}
            className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0">
              <Mail size={32} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Email</div>
              <div className="text-sm text-gray-600">Detailed form with specifications</div>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
