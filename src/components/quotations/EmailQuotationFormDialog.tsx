import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Loader, ArrowLeft } from 'lucide-react';

interface EmailQuotationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: EmailQuotationFormData) => void;
  isLoading?: boolean;
  productName?: string;
  productSku?: string;
  category?: string;
}

export interface EmailQuotationFormData {
  quantity: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  additionalNotes: string;
}

const initialFormData: EmailQuotationFormData = {
  quantity: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  additionalNotes: ''
};

export function EmailQuotationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  productName,
  productSku,
  category
}: EmailQuotationFormDialogProps) {
  const [formData, setFormData] = useState<EmailQuotationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company/Institution name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      // Reset form after successful submission
      setFormData(initialFormData);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      setFormData(initialFormData);
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Quotation Request
          </DialogTitle>
          <DialogDescription>
            {productName ? (
              <span>Fill in your details to request a quotation for <strong>{productName}</strong></span>
            ) : (
              <span>Fill in your details and we'll send you a quotation</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Display */}
          {(productName || category) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold">PRODUCT</p>
              {category && (
                <p className="text-sm text-blue-900 font-medium">{category}</p>
              )}
              {productName && (
                <p className="text-sm text-blue-700">{productName}</p>
              )}
              {productSku && (
                <p className="text-xs text-blue-600">SKU: {productSku}</p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <Label htmlFor="email-quantity" className="text-gray-700 text-sm">
              Quantity *
            </Label>
            <Input
              id="email-quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 50"
              disabled={isLoading}
              className={errors.quantity ? 'border-red-500' : ''}
            />
            {errors.quantity && (
              <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="email-company" className="text-gray-700 text-sm">
              Company/Institution Name *
            </Label>
            <Input
              id="email-company"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your organization name"
              disabled={isLoading}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <Label htmlFor="email-contact" className="text-gray-700 text-sm">
              Contact Person
            </Label>
            <Input
              id="email-contact"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Your full name"
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email-address" className="text-gray-700 text-sm">
              Email Address * <span className="text-xs text-blue-600">(we'll reply here)</span>
            </Label>
            <Input
              id="email-address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              disabled={isLoading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">We'll send the quotation to this email address</p>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="email-phone" className="text-gray-700 text-sm">
              Phone Number *
            </Label>
            <Input
              id="email-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 XXX XXX XXX"
              disabled={isLoading}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="email-notes" className="text-gray-700 text-sm">
              Additional Notes or Special Requirements
            </Label>
            <textarea
              id="email-notes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any special requirements or additional information..."
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={16} className="mr-2" />
                Send Request
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center pt-2">
          * Required fields
        </p>
      </DialogContent>
    </Dialog>
  );
}
