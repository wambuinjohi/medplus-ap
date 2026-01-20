import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, AlertCircle } from 'lucide-react';

interface EmailConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  senderEmail: string;
  senderName: string;
  companyName: string;
  phoneNumber: string;
  productName: string;
  quantity: string;
}

export function EmailConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading = false,
  senderEmail,
  senderName,
  companyName,
  phoneNumber,
  productName,
  quantity
}: EmailConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Confirm Email Submission
          </DialogTitle>
          <DialogDescription>
            Please verify your contact details below. We'll reply to your email address with the quotation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Warning */}
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Reply Address</p>
              <p className="text-blue-700 font-mono break-all">{senderEmail}</p>
            </div>
          </div>

          {/* Sender Details Summary */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Contact Person</p>
              <p className="text-sm font-medium text-gray-900">{senderName || 'Not provided'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Company</p>
              <p className="text-sm font-medium text-gray-900">{companyName}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
              <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">Product</p>
              <p className="text-sm font-medium text-gray-900">
                {productName} x {quantity}
              </p>
            </div>
          </div>

          {/* Important Note */}
          <div className="text-xs text-gray-600 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-900 mb-1">📧 Make sure your email is correct</p>
            <p>The sales team will reply to <span className="font-mono font-semibold">{senderEmail}</span> with your quotation.</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Edit Details
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Sending...' : 'Send Quotation Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
