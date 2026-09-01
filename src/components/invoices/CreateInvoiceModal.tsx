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
import { SearchableCustomerSelect } from '@/components/ui/searchable-customer-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Trash2,
  Search,
  Calculator,
  Receipt,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useCustomers, useGenerateDocumentNumber, useTaxSettings, useCompanies } from '@/hooks/useDatabase';
import { useOptimizedProductSearch, usePopularProducts } from '@/hooks/useOptimizedProducts';
import { useCreateInvoiceWithItems } from '@/hooks/useQuotationItems';
import { useCustomerCreditStatus } from '@/hooks/useCustomerCreditStatus';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getTermsAndConditions } from '@/utils/termsManager';

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_before_vat?: number;
  tax_percentage: number;
  tax_amount: number;
  tax_inclusive: boolean;
  line_total: number;
  batch_no?: string;
  expiry_date?: string | null;
}

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCustomer?: any;
}

export function CreateInvoiceModal({ open, onOpenChange, onSuccess, preSelectedCustomer }: CreateInvoiceModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedCustomer?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lpoNumber, setLpoNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(getTermsAndConditions());

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<{
    step: string;
    current: number;
    total: number;
  } | null>(null);

  // Get current user and company from context
  const { profile, loading: authLoading } = useAuth();
  const { data: companies } = useCompanies();
  const currentCompany = companies?.[0];
  const { data: customers, isLoading: loadingCustomers } = useCustomers(currentCompany?.id);
  const {
    data: searchedProducts,
    isLoading: loadingProducts,
    searchTerm: searchProduct,
    setSearchTerm: setSearchProduct,
    isSearching
  } = useOptimizedProductSearch(currentCompany?.id, open);
  const { data: popularProducts } = usePopularProducts(currentCompany?.id, 10);
  const { data: taxSettings } = useTaxSettings(currentCompany?.id);
  const createInvoiceWithItems = useCreateInvoiceWithItems();
  const generateDocNumber = useGenerateDocumentNumber();
  const { data: creditStatus } = useCustomerCreditStatus(selectedCustomerId, currentCompany?.id);

  // Get default tax rate
  const defaultTax = taxSettings?.find(tax => tax.is_default && tax.is_active);
  const defaultTaxRate = defaultTax?.rate ?? 0;

  // Handle pre-selected customer
  useEffect(() => {
    if (preSelectedCustomer && open) {
      setSelectedCustomerId(preSelectedCustomer.id);
    }
  }, [preSelectedCustomer, open]);

  // Use optimized search results or popular products when no search term
  const displayProducts = searchProduct.trim() ? searchedProducts : popularProducts;

  const normalizeExpiryDate = (value: string | null | undefined): string | null => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  };

  const addItem = (product: any) => {
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    // Use defensive price fallback - try selling_price first, then unit_price
    const price = Number(product.selling_price || product.unit_price || 0);
    if (isNaN(price) || price === 0) {
      console.warn('Product price missing or invalid for product:', product);
      toast.warning(`Product "${product.name}" has no price set`);
    }

    // Auto-populate with product details and smart defaults
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      description: product.description || product.name,
      quantity: 1,
      unit_price: price,
      discount_before_vat: 0,
      tax_percentage: 0,
      tax_amount: 0,
      tax_inclusive: false,
      line_total: price,
      batch_no: product.batch_no || '',
      expiry_date: normalizeExpiryDate(product.expiry_date)
    };

    const { lineTotal, taxAmount } = calculateLineTotal(newItem);
    newItem.line_total = lineTotal;
    newItem.tax_amount = taxAmount;

    setItems([...items, newItem]);
    setSearchProduct('');

    // Show success message with calculated totals
    toast.success(`Added "${product.name}" - ${formatCurrency(lineTotal)} (incl. tax)`);
  };

  const calculateLineTotal = (item: InvoiceItem, quantity?: number, unitPrice?: number, discountPercentage?: number, taxPercentage?: number, taxInclusive?: boolean) => {
    const qty = quantity ?? item.quantity;
    const price = unitPrice ?? item.unit_price;
    const discount = discountPercentage ?? item.discount_before_vat ?? 0;
    const inclusive = taxInclusive ?? item.tax_inclusive;
    const tax = inclusive ? (taxPercentage ?? item.tax_percentage) : 0;

    // Calculate base amount after discount
    const baseAmount = qty * price;
    const discountAmount = baseAmount * (discount / 100);
    const afterDiscountAmount = baseAmount - discountAmount;

    let taxAmount = 0;
    let lineTotal = 0;

    if (tax === 0 || !inclusive) {
      // No tax or tax checkbox unchecked
      lineTotal = afterDiscountAmount;
      taxAmount = 0;
    } else {
      // Tax checkbox checked: add tax to the discounted amount
      taxAmount = afterDiscountAmount * (tax / 100);
      lineTotal = afterDiscountAmount + taxAmount;
    }

    return { lineTotal, taxAmount, discountAmount };
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

  const updateItemVAT = (itemId: string, vatPercentage: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const normalizedTaxPercentage = item.tax_inclusive ? vatPercentage : 0;
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, normalizedTaxPercentage);
        return { ...item, tax_percentage: normalizedTaxPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemTax = (itemId: string, taxPercentage: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const normalizedTaxPercentage = item.tax_inclusive ? taxPercentage : 0;
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, normalizedTaxPercentage);
        return { ...item, tax_percentage: normalizedTaxPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemDiscountBeforeVat = (itemId: string, discountBeforeVat: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, discountBeforeVat);
        return { ...item, discount_before_vat: discountBeforeVat, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemTaxInclusive = (itemId: string, taxInclusive: boolean) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newTaxPercentage = taxInclusive ? (item.tax_percentage || defaultTaxRate) : 0;
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, newTaxPercentage, taxInclusive);
        return { ...item, tax_inclusive: taxInclusive, tax_percentage: newTaxPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemBatchNo = (itemId: string, batchNo: string) => {
    setItems(items.map(item => item.id === itemId ? { ...item, batch_no: batchNo } : item));
  };

  const updateItemExpiryDate = (itemId: string, expiryDate: string | null) => {
    setItems(items.map(item => item.id === itemId ? { ...item, expiry_date: expiryDate } : item));
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

  const subtotal = items.reduce((sum, item) => {
    // Calculate subtotal as base amount minus discounts
    const baseAmount = item.quantity * item.unit_price;
    const discountAmount = baseAmount * ((item.discount_before_vat || 0) / 100);
    return sum + (baseAmount - discountAmount);
  }, 0);
  const totalDiscountAmount = items.reduce((sum, item) => {
    const baseAmount = item.quantity * item.unit_price;
    return sum + (baseAmount * ((item.discount_before_vat || 0) / 100));
  }, 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0);
  const balanceDue = totalAmount; // Full amount due initially

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Validate invoice total amount (prevent zero-amount invoices)
    if (totalAmount <= 0) {
      toast.error('Invoice total must be greater than 0. Please add items or adjust prices.');
      return;
    }

    // Validate required fields
    if (!currentCompany?.id) {
      toast.error('No company selected. Please ensure you are associated with a company.');
      return;
    }

    // Check if auth is still loading
    if (authLoading) {
      toast.info('Please wait, authenticating user...');
      return;
    }

    // Check if user is authenticated and has profile
    if (!profile?.id) {
      toast.error('User not authenticated. Please sign in and try again.');
      return;
    }

    // Credit limit check
    if (creditStatus && creditStatus.credit_limit > 0) {
      const newOutstanding = creditStatus.total_outstanding + totalAmount;
      if (newOutstanding > creditStatus.credit_limit && !creditStatus.allow_credit_beyond_limit) {
        toast.error('Invoice exceeds credit limit. Admin must enable credit override for this account.');
        return;
      }
    }

    const normalizedItems = items.map(item => {
      const normalizedTaxPercentage = item.tax_inclusive ? item.tax_percentage : 0;
      const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, normalizedTaxPercentage, item.tax_inclusive);
      return { ...item, tax_percentage: normalizedTaxPercentage, tax_amount: taxAmount, line_total: lineTotal };
    });
    const normalizedSubtotal = normalizedItems.reduce((sum, item) => {
      const baseAmount = item.quantity * item.unit_price;
      return sum + baseAmount - baseAmount * ((item.discount_before_vat ?? 0) / 100);
    }, 0);
    const normalizedTaxAmount = normalizedItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const normalizedTotalAmount = normalizedItems.reduce((sum, item) => sum + item.line_total, 0);

    setIsSubmitting(true);
    setSubmitProgress({
      step: 'Preparing invoice data...',
      current: 1,
      total: 4
    });

    try {
      // Step 1: Generate invoice number
      setSubmitProgress({
        step: 'Generating invoice number...',
        current: 1,
        total: 4
      });

      const invoiceNumber = await generateDocNumber.mutateAsync({
        companyId: currentCompany.id,
        type: 'invoice'
      });

      // Step 2: Prepare invoice data
      setSubmitProgress({
        step: 'Preparing invoice data...',
        current: 2,
        total: 4
      });

      const invoiceData = {
        company_id: currentCompany.id,
        customer_id: selectedCustomerId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        lpo_number: lpoNumber || null,
        status: 'draft',
        subtotal: normalizedSubtotal,
        tax_amount: normalizedTaxAmount,
        total_amount: normalizedTotalAmount,
        paid_amount: 0,
        balance_due: normalizedTotalAmount,
        terms_and_conditions: termsAndConditions,
        notes: notes,
        created_by: profile?.id
      };

      const invoiceItems = normalizedItems.map(item => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_before_vat: item.discount_before_vat ?? 0,
        tax_percentage: item.tax_percentage,
        tax_amount: item.tax_amount,
        tax_inclusive: item.tax_inclusive,
        line_total: item.line_total,
        batch_no: item.batch_no || 'N/A',
        expiry_date: item.expiry_date || null
      }));

      // Step 3: Create invoice and items
      setSubmitProgress({
        step: `Creating invoice with ${items.length} items...`,
        current: 3,
        total: 4
      });

      await createInvoiceWithItems.mutateAsync({
        invoice: invoiceData,
        items: invoiceItems
      });

      // Step 4: Finalizing
      setSubmitProgress({
        step: 'Finalizing invoice creation...',
        current: 4,
        total: 4
      });

      toast.success(`Invoice ${invoiceNumber} created successfully!`);
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        } else if (supabaseError.hint) {
          errorMessage = supabaseError.hint;
        } else if (supabaseError.error?.message) {
          errorMessage = supabaseError.error.message;
        } else {
          errorMessage = 'Database operation failed. Please check your data and try again.';
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(`Failed to create invoice: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(null);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setLpoNumber('');
    setNotes('');
    setTermsAndConditions(getTermsAndConditions());
    setItems([]);
    setSearchProduct('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span>Create New Invoice</span>
          </DialogTitle>
          <DialogDescription>
            Create a detailed invoice with multiple items for your customer
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection */}
                <SearchableCustomerSelect
                  customers={customers || []}
                  isLoading={loadingCustomers}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  label="Customer"
                  required={true}
                  placeholder="Search and select a customer..."
                />

                {/* Credit Status Panel */}
                {selectedCustomerId && creditStatus && creditStatus.credit_limit > 0 && (
                  <Card className={
                    totalAmount > 0 && creditStatus.total_outstanding + totalAmount > creditStatus.credit_limit
                      ? creditStatus.allow_credit_beyond_limit
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-red-300 bg-red-50'
                      : creditStatus.utilization_percent >= 70
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-green-200 bg-green-50/50'
                  }>
                    <CardContent className="pt-4 pb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Credit Limit</span>
                          <span>{formatCurrency(creditStatus.credit_limit)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Outstanding</span>
                          <span>{formatCurrency(creditStatus.total_outstanding)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Available Credit</span>
                          <span className={creditStatus.available_credit < 0 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(creditStatus.available_credit)}
                          </span>
                        </div>
                        {totalAmount > 0 && (
                          <>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">This Invoice</span>
                                <span>{formatCurrency(totalAmount)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Remaining After</span>
                              <span className={
                                creditStatus.available_credit - totalAmount < 0
                                  ? 'text-red-600 font-semibold'
                                  : 'text-green-600 font-medium'
                              }>
                                {formatCurrency(creditStatus.available_credit - totalAmount)}
                              </span>
                            </div>
                          </>
                        )}
                        {/* Utilization bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                creditStatus.utilization_percent >= 100
                                  ? 'bg-red-500'
                                  : creditStatus.utilization_percent >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(creditStatus.utilization_percent, 100)}%` }}
                            />
                          </div>
                        </div>
                        {/* Warning messages */}
                        {totalAmount > 0 && creditStatus.total_outstanding + totalAmount > creditStatus.credit_limit && (
                          <div className={`flex items-center gap-2 text-xs mt-1 ${
                            creditStatus.allow_credit_beyond_limit ? 'text-amber-700' : 'text-red-700'
                          }`}>
                            <AlertTriangle className="h-3 w-3" />
                            <span>
                              {creditStatus.allow_credit_beyond_limit
                                ? 'Credit override active — invoice will proceed beyond limit.'
                                : 'Invoice exceeds credit limit. Admin must enable credit override.'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_date">Invoice Date *</Label>
                    <Input
                      id="invoice_date"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* LPO Number */}
                <div className="space-y-2">
                  <Label htmlFor="lpo_number">LPO Number (Optional)</Label>
                  <Input
                    id="lpo_number"
                    type="text"
                    value={lpoNumber}
                    onChange={(e) => setLpoNumber(e.target.value)}
                    placeholder="Enter LPO reference number"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes for this invoice..."
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms and Conditions</Label>
                  <Textarea
                    id="terms"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    rows={3}
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name or code..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Product List */}
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {(loadingProducts || isSearching) ? (
                      <div className="p-4 text-center text-muted-foreground">
                        {searchProduct ? 'Searching products...' : 'Loading products...'}
                      </div>
                    ) : (displayProducts && displayProducts.length === 0) ? (
                      <div className="p-4 text-center text-muted-foreground">
                        {searchProduct ? 'No products found' : 'No products available'}
                      </div>
                    ) : (
                      (displayProducts || []).map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-smooth"
                          onClick={() => addItem(product)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.product_code}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(product.unit_price)}</div>
                              <div className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</div>
                              {product.category_name && (
                                <div className="text-xs text-muted-foreground">{product.category_name}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Hint when no search term */}
                  {!searchProduct && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      Start typing to search products, or select from popular items above
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
              <span>Invoice Items</span>
              <Badge variant="outline">{items.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Search and select products to add them.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Disc. Before VAT (%)</TableHead>
                    <TableHead>VAT %</TableHead>
                    <TableHead>VAT Incl.</TableHead>
                    <TableHead>Batch No</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Line Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
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
                          value={item.discount_before_vat || 0}
                          onChange={(e) => updateItemDiscountBeforeVat(item.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                          step="0.01"
                          placeholder="0.00"
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
                          disabled={!item.tax_inclusive}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={item.tax_inclusive}
                          onCheckedChange={(checked) => updateItemTaxInclusive(item.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.batch_no || ''}
                          onChange={(e) => updateItemBatchNo(item.id, e.target.value)}
                          className="w-24"
                          placeholder="Batch"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.expiry_date || ''}
                          onChange={(e) => updateItemExpiryDate(item.id, e.target.value || null)}
                          className="w-32"
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
                  ))}
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
                      <span className="font-semibold">{formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}</span>
                    </div>
                    {totalDiscountAmount > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Discount:</span>
                        <span className="font-semibold">-{formatCurrency(totalDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>After Discount:</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-2">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Items: {items.length}</span>
                      <span>Balance Due: {formatCurrency(balanceDue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        {submitProgress && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {submitProgress.step}
                  </span>
                  <span className="text-xs text-blue-700">
                    {submitProgress.current} of {submitProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(submitProgress.current / submitProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          {(() => {
            const creditExceeded = creditStatus && creditStatus.credit_limit > 0 &&
              creditStatus.total_outstanding + totalAmount > creditStatus.credit_limit &&
              !creditStatus.allow_credit_beyond_limit;
            return (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCustomerId || items.length === 0 || creditExceeded}
                className="min-w-32"
                variant={creditExceeded ? 'destructive' : 'default'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitProgress ? 'Processing...' : 'Creating...'}
                  </>
                ) : creditExceeded ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Credit Limit Exceeded
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" />
                    Create Invoice
                  </>
                )}
              </Button>
            );
          })()}
        </DialogFooter>
      </DialogContent>

    </Dialog>
  );
}
