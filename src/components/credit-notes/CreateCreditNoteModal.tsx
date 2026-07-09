import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Search,
  Calculator,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCustomers, useProducts, useTaxSettings, useCompanies } from '@/hooks/useDatabase';
import { useInvoicesFixed as useInvoices } from '@/hooks/useInvoicesFixed';
import { useGenerateCreditNoteNumber, useApplyCreditNoteToInvoice } from '@/hooks/useCreditNotes';
import { useCreateCreditNoteWithItems } from '@/hooks/useCreditNoteItems';
import { useCustomerInvoices } from '@/hooks/useCustomerInvoices';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { toast } from 'sonner';
import { getTermsAndConditions } from '@/utils/termsManager';
import { supabase } from '@/integrations/supabase/client';

interface CreditNoteItem {
  id: string;
  product_id?: string; // Optional to allow custom items
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  tax_amount: number;
  tax_inclusive: boolean;
  line_total: number;
}

interface CreateCreditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCustomer?: any;
  preSelectedInvoice?: any;
}

export function CreateCreditNoteModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  preSelectedCustomer,
  preSelectedInvoice 
}: CreateCreditNoteModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedCustomer?.id || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(preSelectedInvoice?.id || 'none');
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(getTermsAndConditions());
  const [affectsInventory, setAffectsInventory] = useState(false);

  const [items, setItems] = useState<CreditNoteItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [autoApplyAmount, setAutoApplyAmount] = useState<number | null>(null);

  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchValue, setCustomerSearchValue] = useState('');

  const [creditNoteMode, setCreditNoteMode] = useState<'fromInvoice' | 'nominal'>('fromInvoice');
  const [nominalAmount, setNominalAmount] = useState<number | null>(null);

  const { data: companies, isLoading: loadingCompanies, error: companiesError } = useCompanies();
  const companyId = companies?.[0]?.id;

  const { data: customers, isLoading: loadingCustomers } = useCustomers(companyId);
  const { data: products, isLoading: loadingProducts } = useProducts(companyId);
  const { data: taxSettings } = useTaxSettings(companyId);
  const { data: invoices } = useInvoices(companyId);
  const createCreditNoteWithItems = useCreateCreditNoteWithItems();
  const generateCreditNoteNumber = useGenerateCreditNoteNumber();
  const applyCreditNoteToInvoice = useApplyCreditNoteToInvoice();
  const { data: customerInvoices = [], isLoading: loadingCustomerInvoices, error: customerInvoicesError } = useCustomerInvoices(selectedCustomerId || undefined, companyId);
  const { data: invoiceItems = [], isLoading: loadingInvoiceItems } = useInvoiceItems(
    selectedInvoiceId && selectedInvoiceId !== 'none' ? selectedInvoiceId : undefined
  );

  // Debug logging
  useEffect(() => {
    if (selectedCustomerId && companyId) {
      console.log('Fetching invoices for customer:', selectedCustomerId, 'company:', companyId);
    }
  }, [selectedCustomerId, companyId]);

  useEffect(() => {
    if (customerInvoicesError) {
      console.error('Customer invoices error:', customerInvoicesError);
    }
  }, [customerInvoicesError]);

  // Get default tax rate
  const defaultTax = taxSettings?.find(tax => tax.is_default && tax.is_active);
  const defaultTaxRate = defaultTax?.rate || 16;

  // Handle pre-selected data and clear invoice when customer changes
  useEffect(() => {
    if (preSelectedCustomer && open) {
      setSelectedCustomerId(preSelectedCustomer.id);
    }
    if (preSelectedInvoice && open) {
      setSelectedInvoiceId(preSelectedInvoice.id);
      setSelectedCustomerId(preSelectedInvoice.customer_id);
    }
  }, [preSelectedCustomer, preSelectedInvoice, open]);

  // Clear invoice selection when customer changes
  useEffect(() => {
    setSelectedInvoiceId('none');
    setItems([]);
  }, [selectedCustomerId]);

  // Auto-populate invoice items when invoice is selected (only in fromInvoice mode)
  useEffect(() => {
    if (creditNoteMode === 'fromInvoice' && selectedInvoiceId && selectedInvoiceId !== 'none' && invoiceItems.length > 0) {
      console.log('Auto-populating invoice items:', invoiceItems.length);
      // Clear existing items and add all invoice items
      const newItems = invoiceItems.map((item) => ({
        id: `invoice-item-${item.id}`,
        product_id: item.product_id,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_percentage: item.tax_percentage,
        tax_amount: item.tax_amount,
        tax_inclusive: item.tax_inclusive,
        line_total: item.line_total
      }));
      setItems(newItems);
    }
  }, [creditNoteMode, selectedInvoiceId, invoiceItems]);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchProduct.toLowerCase())
  ) || [];

  const addItem = (product: any) => {
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    const newItem: CreditNoteItem = {
      id: `temp-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      description: product.description || product.name,
      quantity: 1,
      unit_price: product.selling_price,
      tax_percentage: 0,
      tax_amount: 0,
      tax_inclusive: false,
      line_total: product.selling_price
    };

    const { lineTotal, taxAmount } = calculateLineTotal(newItem);
    newItem.line_total = lineTotal;
    newItem.tax_amount = taxAmount;

    setItems([...items, newItem]);
    setSearchProduct('');
  };

  const addInvoiceItem = (invoiceItem: any) => {
    const existingItem = items.find(item => item.product_id === invoiceItem.product_id);

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + invoiceItem.quantity);
      return;
    }

    const newItem: CreditNoteItem = {
      id: `temp-${Date.now()}`,
      product_id: invoiceItem.product_id,
      product_name: invoiceItem.product_name,
      description: invoiceItem.description,
      quantity: invoiceItem.quantity,
      unit_price: invoiceItem.unit_price,
      tax_percentage: invoiceItem.tax_percentage,
      tax_amount: invoiceItem.tax_amount,
      tax_inclusive: invoiceItem.tax_inclusive,
      line_total: invoiceItem.line_total
    };

    setItems([...items, newItem]);
  };

  const addCustomItem = () => {
    const newItem: CreditNoteItem = {
      id: `custom-${Date.now()}`,
      product_id: undefined, // No product association
      product_name: 'Custom Item',
      description: 'Custom credit item',
      quantity: 1,
      unit_price: 0,
      tax_percentage: 0,
      tax_amount: 0,
      tax_inclusive: false,
      line_total: 0
    };

    setItems([...items, newItem]);
  };

  const calculateLineTotal = (item: CreditNoteItem, quantity?: number, unitPrice?: number, taxPercentage?: number, taxInclusive?: boolean) => {
    const qty = quantity ?? item.quantity;
    const price = unitPrice ?? item.unit_price;
    const tax = taxPercentage ?? item.tax_percentage;
    const inclusive = taxInclusive ?? item.tax_inclusive;

    const baseAmount = qty * price;
    let taxAmount = 0;
    let lineTotal = 0;

    if (tax === 0) {
      // No tax
      lineTotal = baseAmount;
      taxAmount = 0;
    } else if (inclusive) {
      // Tax-inclusive: tax is included in the price
      lineTotal = baseAmount;
      taxAmount = baseAmount * (tax / (100 + tax));
    } else {
      // Tax-exclusive: tax is added to the price
      taxAmount = baseAmount * (tax / 100);
      lineTotal = baseAmount + taxAmount;
    }

    return { lineTotal, taxAmount };
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(items.map(item => {
      if (item.id === itemId) {
        const { lineTotal, taxAmount } = calculateLineTotal(item, quantity);
        return { ...item, quantity, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemPrice = (itemId: string, unitPrice: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, unitPrice);
        return { ...item, unit_price: unitPrice, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemTax = (itemId: string, taxPercentage: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, taxPercentage);
        return { ...item, tax_percentage: taxPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemTaxInclusive = (itemId: string, taxInclusive: boolean) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        let newTaxPercentage = item.tax_percentage;
        if (taxInclusive && item.tax_percentage === 0) {
          newTaxPercentage = defaultTaxRate;
        }
        if (!taxInclusive) {
          newTaxPercentage = 0;
        }

        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, newTaxPercentage, taxInclusive);
        return { ...item, tax_inclusive: taxInclusive, tax_percentage: newTaxPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0);

  const handleSubmit = async () => {
    // Enhanced validation
    if (!companyId) {
      toast.error('Company information not available. Please ensure you have a company set up.');
      return;
    }

    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the credit note');
      return;
    }

    // Mode-specific validation
    if (creditNoteMode === 'nominal') {
      if (!nominalAmount || nominalAmount <= 0) {
        toast.error('Please enter a valid credit note amount');
        return;
      }
    } else {
      // fromInvoice mode
      if (items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      // Validate items
      const invalidItems = items.filter(item =>
        !item.description.trim() ||
        item.quantity <= 0 ||
        item.unit_price < 0
      );

      if (invalidItems.length > 0) {
        toast.error('Please ensure all items have valid descriptions, quantities, and prices.');
        return;
      }

      // Validate total amount
      if (totalAmount <= 0) {
        toast.error('Credit note total amount must be greater than zero.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Generate credit note number
      const creditNoteNumber = await generateCreditNoteNumber.mutateAsync(companyId);

      // Determine totals based on mode
      let finalSubtotal = 0;
      let finalTaxAmount = 0;
      let finalTotalAmount = 0;

      if (creditNoteMode === 'nominal') {
        finalTotalAmount = nominalAmount || 0;
        finalSubtotal = nominalAmount || 0;
        finalTaxAmount = 0;
      } else {
        finalSubtotal = subtotal;
        finalTaxAmount = taxAmount;
        finalTotalAmount = totalAmount;
      }

      // Create credit note with items
      const creditNoteData = {
        company_id: companyId,
        customer_id: selectedCustomerId,
        invoice_id: creditNoteMode === 'nominal' ? null : (selectedInvoiceId && selectedInvoiceId !== 'none' ? selectedInvoiceId : null),
        credit_note_number: creditNoteNumber,
        credit_note_date: creditNoteDate,
        status: 'draft' as const,
        reason: reason,
        subtotal: finalSubtotal,
        tax_amount: finalTaxAmount,
        total_amount: finalTotalAmount,
        applied_amount: 0,
        balance: finalTotalAmount,
        affects_inventory: creditNoteMode === 'nominal' ? false : affectsInventory,
        notes: notes,
        terms_and_conditions: termsAndConditions,
        created_by: null // TODO: Get from auth context when implemented
      };

      let creditNoteItems;
      if (creditNoteMode === 'nominal') {
        // For nominal mode, create a single line item
        creditNoteItems = [{
          product_id: null,
          description: reason,
          quantity: 1,
          unit_price: nominalAmount || 0,
          tax_percentage: 0,
          tax_amount: 0,
          tax_inclusive: false,
          tax_setting_id: null,
          line_total: nominalAmount || 0,
          sort_order: 0
        }];
      } else {
        // For fromInvoice mode, use the added items
        creditNoteItems = items.map((item, index) => ({
          product_id: item.product_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_percentage: item.tax_percentage,
          tax_amount: item.tax_amount,
          tax_inclusive: item.tax_inclusive,
          tax_setting_id: item.tax_percentage > 0 ? defaultTax?.id || null : null,
          line_total: item.line_total,
          sort_order: index
        }));
      }

      const createdCreditNote = await createCreditNoteWithItems.mutateAsync({
        creditNote: creditNoteData,
        items: creditNoteItems
      });

      // Auto-apply if checkbox is selected (only in fromInvoice mode)
      if (creditNoteMode === 'fromInvoice' && autoApply && selectedInvoiceId && selectedInvoiceId !== 'none') {
        try {
          const authUser = await supabase.auth.getUser();
          const userId = authUser?.data?.user?.id || 'system';
          const applyAmount = autoApplyAmount ?? totalAmount;

          // Validate amount
          if (applyAmount <= 0) {
            toast.error('Apply amount must be greater than zero');
            setIsSubmitting(false);
            return;
          }

          if (applyAmount > totalAmount) {
            toast.error(`Apply amount cannot exceed credit note total (${formatCurrency(totalAmount)})`);
            setIsSubmitting(false);
            return;
          }

          await applyCreditNoteToInvoice.mutateAsync({
            creditNoteId: createdCreditNote.id,
            invoiceId: selectedInvoiceId,
            amount: applyAmount,
            appliedBy: userId
          });

          toast.success(`Credit note ${creditNoteNumber} created and applied successfully!`);
        } catch (applyError) {
          console.error('Error auto-applying credit note:', applyError);
          toast.error('Credit note created but auto-apply failed. You can apply it manually.');
        }
      } else {
        toast.success(`Credit note ${creditNoteNumber} created successfully!`);
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating credit note:', error);
      toast.error('Failed to create credit note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedInvoiceId('none');
    setCreditNoteDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setNotes('');
    setTermsAndConditions('All credits must be used within 90 days.');
    setAffectsInventory(false);
    setAutoApply(false);
    setAutoApplyAmount(null);
    setItems([]);
    setSearchProduct('');
    setCreditNoteMode('fromInvoice');
    setNominalAmount(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Create Credit Note</span>
          </DialogTitle>
          <DialogDescription>
            Create a credit note to refund or adjust customer accounts
          </DialogDescription>
        </DialogHeader>

        {/* Mode Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              setCreditNoteMode('fromInvoice');
              setItems([]);
              setSelectedInvoiceId('none');
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              creditNoteMode === 'fromInvoice'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            From Invoice
          </button>
          <button
            onClick={() => {
              setCreditNoteMode('nominal');
              setItems([]);
              setNominalAmount(null);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              creditNoteMode === 'nominal'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Nominal
          </button>
        </div>

        {creditNoteMode === 'fromInvoice' && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Credit Note Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credit Note Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className="w-full justify-between"
                        disabled={loadingCustomers}
                      >
                        {selectedCustomerId && customers
                          ? customers.find(c => c.id === selectedCustomerId)?.name +
                            ' (' + customers.find(c => c.id === selectedCustomerId)?.customer_code + ')'
                          : "Select a customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" side="bottom" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search customers by name or code..."
                          value={customerSearchValue}
                          onValueChange={setCustomerSearchValue}
                          autoFocus
                        />
                        <CommandEmpty>No customers found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {customers
                              ?.filter((customer) =>
                                customer.name.toLowerCase().includes(customerSearchValue.toLowerCase()) ||
                                customer.customer_code.toLowerCase().includes(customerSearchValue.toLowerCase())
                              )
                              .map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.id}
                                  onSelect={(currentValue) => {
                                    setSelectedCustomerId(currentValue === selectedCustomerId ? "" : currentValue);
                                    setSelectedInvoiceId('none');
                                    setCustomerSearchOpen(false);
                                    setCustomerSearchValue('');
                                  }}
                                >
                                  <Check
                                    className="mr-2 h-4 w-4"
                                    style={{
                                      opacity: selectedCustomerId === customer.id ? 1 : 0,
                                    }}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{customer.name}</span>
                                    <span className="text-xs text-muted-foreground">{customer.customer_code}</span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Invoice Selection (Optional) */}
                {selectedCustomerId && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="invoice">Related Invoice (Optional)</Label>
                      <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId} disabled={loadingCustomerInvoices}>
                        <SelectTrigger className={loadingCustomerInvoices ? 'opacity-60' : ''}>
                          <SelectValue placeholder={loadingCustomerInvoices ? "Loading invoices..." : "Select an invoice (optional)"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific invoice</SelectItem>
                          {customerInvoicesError && (
                            <SelectItem value="error" disabled>
                              Error loading invoices
                            </SelectItem>
                          )}
                          {customerInvoices.length === 0 && !loadingCustomerInvoices && (
                            <SelectItem value="no-invoices" disabled>
                              No invoices with outstanding balance
                            </SelectItem>
                          )}
                          {customerInvoices.map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.invoice_number} - {formatCurrency(invoice.balance_due || 0)} due
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedInvoiceId && selectedInvoiceId !== 'none' && (
                      <>
                        {/* Invoice Products */}
                        {loadingInvoiceItems ? (
                          <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-md">
                            Loading invoice items...
                          </div>
                        ) : invoiceItems.length > 0 ? (
                          <div className="space-y-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                            <Label className="text-sm font-medium">
                              Invoice Items (Auto-populated)
                            </Label>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {invoiceItems.map((item) => {
                                const isAdded = items.some(i => i.product_id === item.product_id);
                                return (
                                  <div
                                    key={item.id}
                                    className="p-2 rounded-md border bg-white border-slate-200"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{item.product_name}</div>
                                        <div className="text-xs text-muted-foreground">{item.description}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                                          {item.tax_percentage > 0 && ` (+ ${item.tax_percentage}% tax)`}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold text-sm">{formatCurrency(item.line_total)}</div>
                                        {isAdded && (
                                          <Badge className="text-xs bg-green-600 text-white mt-1">
                                            Included
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground italic mt-2">
                              All invoice items have been automatically added to the credit note. You can edit quantities and prices in the items table below.
                            </p>
                          </div>
                        ) : null}

                        <div className="space-y-2 bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="auto_apply"
                              checked={autoApply}
                              onCheckedChange={(checked) => {
                                setAutoApply(!!checked);
                                if (!checked) setAutoApplyAmount(null);
                              }}
                            />
                            <Label htmlFor="auto_apply" className="text-sm cursor-pointer">
                              Apply to selected invoice immediately upon creation
                            </Label>
                          </div>
                          {autoApply && (
                            <div className="ml-6 space-y-2">
                              <Label htmlFor="auto_apply_amount" className="text-sm">
                                Amount to apply (leave blank to apply full credit note)
                              </Label>
                              <Input
                                id="auto_apply_amount"
                                type="number"
                                value={autoApplyAmount ?? ''}
                                onChange={(e) => setAutoApplyAmount(e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder={`Full amount: ${formatCurrency(totalAmount)}`}
                                step="0.01"
                                min="0"
                                className="h-8"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Date and Reason */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credit_note_date">Credit Note Date *</Label>
                    <Input
                      id="credit_note_date"
                      type="date"
                      value={creditNoteDate}
                      onChange={(e) => setCreditNoteDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason for credit note" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Product Return">Product Return</SelectItem>
                        <SelectItem value="Pricing Error">Pricing Error</SelectItem>
                        <SelectItem value="Billing Error">Billing Error</SelectItem>
                        <SelectItem value="Damaged Goods">Damaged Goods</SelectItem>
                        <SelectItem value="Customer Goodwill">Customer Goodwill</SelectItem>
                        <SelectItem value="Overpayment">Overpayment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Inventory Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="affects_inventory"
                    checked={affectsInventory}
                    onCheckedChange={(checked) => setAffectsInventory(!!checked)}
                  />
                  <Label htmlFor="affects_inventory" className="text-sm">
                    Affects Inventory (returns items to stock)
                  </Label>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes for this credit note..."
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms and Conditions</Label>
                  <Textarea
                    id="terms"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product Search */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name or code..."
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomItem}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Item
                    </Button>
                  </div>

                  {/* Product List */}
                  {searchProduct && (
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {loadingProducts ? (
                        <div className="p-4 text-center text-muted-foreground">Loading products...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No products found</div>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-smooth"
                            onClick={() => addItem(product)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">{product.product_code}</div>
                                {product.description && (
                                  <div className="text-xs text-muted-foreground mt-1">{product.description}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(product.selling_price)}</div>
                                <div className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Credit Note Items</span>
              <Badge variant="outline">{items.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No items added yet.</p>
                <p className="text-sm">
                  {selectedInvoiceId && selectedInvoiceId !== 'none'
                    ? 'Invoice items will appear here. Select an invoice above.'
                    : 'Select an invoice above to auto-populate items, or search and add products manually.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>VAT %</TableHead>
                    <TableHead>VAT Incl.</TableHead>
                    <TableHead>Line Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isFromInvoice = item.id.startsWith('invoice-item-');
                    return (
                    <TableRow key={item.id} className={isFromInvoice ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div>
                          {item.product_id ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.product_name}</span>
                                {isFromInvoice && (
                                  <Badge variant="secondary" className="text-xs">From Invoice</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Input
                                value={item.product_name}
                                onChange={(e) => setItems(items.map(i =>
                                  i.id === item.id ? { ...i, product_name: e.target.value } : i
                                ))}
                                placeholder="Item name"
                                className="font-medium text-sm h-8"
                              />
                              <Input
                                value={item.description}
                                onChange={(e) => setItems(items.map(i =>
                                  i.id === item.id ? { ...i, description: e.target.value } : i
                                ))}
                                placeholder="Description"
                                className="text-sm h-8"
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.tax_percentage}
                          onChange={(e) => updateItemTax(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0"
                          disabled={item.tax_inclusive}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={item.tax_inclusive}
                          onCheckedChange={(checked) => updateItemTaxInclusive(item.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.line_total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-2">
                      <span className="font-bold">Total Credit:</span>
                      <span className="font-bold text-success">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </>
        )}

        {creditNoteMode === 'nominal' && (
        <div className="max-w-2xl mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nominal Credit Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="nominal_customer">Customer *</Label>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                      disabled={loadingCustomers}
                    >
                      {selectedCustomerId && customers
                        ? customers.find(c => c.id === selectedCustomerId)?.name +
                          ' (' + customers.find(c => c.id === selectedCustomerId)?.customer_code + ')'
                        : "Select a customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" side="bottom" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search customers by name or code..."
                        value={customerSearchValue}
                        onValueChange={setCustomerSearchValue}
                        autoFocus
                      />
                      <CommandEmpty>No customers found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {customers
                            ?.filter((customer) =>
                              customer.name.toLowerCase().includes(customerSearchValue.toLowerCase()) ||
                              customer.customer_code.toLowerCase().includes(customerSearchValue.toLowerCase())
                            )
                            .map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.id}
                                onSelect={(currentValue) => {
                                  setSelectedCustomerId(currentValue === selectedCustomerId ? "" : currentValue);
                                  setCustomerSearchOpen(false);
                                  setCustomerSearchValue('');
                                }}
                              >
                                <Check
                                  className="mr-2 h-4 w-4"
                                  style={{
                                    opacity: selectedCustomerId === customer.id ? 1 : 0,
                                  }}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{customer.name}</span>
                                  <span className="text-xs text-muted-foreground">{customer.customer_code}</span>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="nominal_reason">Reason *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason for credit note" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product Return">Product Return</SelectItem>
                    <SelectItem value="Pricing Error">Pricing Error</SelectItem>
                    <SelectItem value="Billing Error">Billing Error</SelectItem>
                    <SelectItem value="Damaged Goods">Damaged Goods</SelectItem>
                    <SelectItem value="Customer Goodwill">Customer Goodwill</SelectItem>
                    <SelectItem value="Overpayment">Overpayment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="nominal_amount">Amount *</Label>
                <Input
                  id="nominal_amount"
                  type="number"
                  value={nominalAmount ?? ''}
                  onChange={(e) => setNominalAmount(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="nominal_date">Credit Note Date *</Label>
                <Input
                  id="nominal_date"
                  type="date"
                  value={creditNoteDate}
                  onChange={(e) => setCreditNoteDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="nominal_notes">Notes</Label>
                <Textarea
                  id="nominal_notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes for this credit note..."
                />
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <Label htmlFor="nominal_terms">Terms and Conditions</Label>
                <Textarea
                  id="nominal_terms"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCustomerId || !reason.trim() || (creditNoteMode === 'fromInvoice' ? items.length === 0 : !nominalAmount || nominalAmount <= 0)}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Credit Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
