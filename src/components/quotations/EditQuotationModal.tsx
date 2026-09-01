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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Search,
  Calculator,
  FileText
} from 'lucide-react';
import { useCustomers, useTaxSettings, useCompanies } from '@/hooks/useDatabase';
import { useOptimizedProductSearch, usePopularProducts } from '@/hooks/useOptimizedProducts';
import { useUpdateQuotationWithItems } from '@/hooks/useQuotationItems';
import { toast } from 'sonner';
import { getTermsAndConditions } from '@/utils/termsManager';
import { calculateDocumentTotals, calculateInvoiceLineTotal } from '@/utils/taxCalculation';

interface QuotationItem {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_before_vat?: number;
  tax_setting_id?: string | null;
  tax_percentage: number;
  tax_amount: number;
  tax_inclusive: boolean;
  line_total: number;
  batch_no?: string;
  expiry_date?: string | null;
}

interface EditQuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  quotation: any;
}

export function EditQuotationModal({ open, onOpenChange, onSuccess, quotation }: EditQuotationModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quotationDate, setQuotationDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(getTermsAndConditions());
  
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companies } = useCompanies();
  const currentCompany = companies?.[0];
  const { data: customers, isLoading: loadingCustomers } = useCustomers(currentCompany?.id);
  const {
    data: searchedProducts,
    isLoading: loadingProducts,
    searchTerm: _searchTerm,
    setSearchTerm: setOptimizedSearchTerm,
    isSearching
  } = useOptimizedProductSearch(currentCompany?.id, open);
  const { data: popularProducts } = usePopularProducts(currentCompany?.id, 20);
  const { data: taxSettings } = useTaxSettings(currentCompany?.id);
  const updateQuotationWithItems = useUpdateQuotationWithItems();

  // Get default tax rate
  const defaultTax = taxSettings?.find(tax => tax.is_default && tax.is_active);
  const defaultTaxRate = defaultTax?.rate ?? 0;

  const displayProducts = searchProduct.trim() ? searchedProducts : popularProducts;

  // Load quotation data when modal opens
  useEffect(() => {
    if (quotation && open) {
      setSelectedCustomerId(quotation.customers?.id || '');
      setQuotationDate(quotation.quotation_date || '');
      setValidUntil(quotation.valid_until || '');
      setNotes(quotation.notes || '');
      setTermsAndConditions(quotation.terms_and_conditions || getTermsAndConditions());

      // Convert quotation items to local format
      const quotationItems = (quotation.quotation_items || []).map((item: any, index: number) => ({
        id: item.id || `existing-${index}`,
        product_id: item.product_id || '',
        product_name: item.products?.name || 'Unknown Product',
        description: item.description || '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        discount_percentage: item.discount_percentage ?? 0,
        discount_before_vat: item.discount_before_vat ?? 0,
        tax_setting_id: item.tax_setting_id ?? null,
        tax_percentage: item.tax_percentage ?? 0,
        tax_amount: item.tax_amount ?? 0,
        tax_inclusive: item.tax_inclusive === true,
        line_total: item.line_total ?? 0,
        batch_no: item.batch_no || '',
        expiry_date: item.expiry_date || null,
      }));

      setItems(quotationItems.map((item: QuotationItem) => {
        const { lineTotal, taxAmount } = calculateLineTotal(item);
        return { ...item, tax_amount: taxAmount, line_total: lineTotal };
      }));
    }
  }, [quotation, open]);

  const calculateLineTotal = (item: QuotationItem, quantity?: number, unitPrice?: number, discountPercentage?: number, taxPercentage?: number, taxInclusive?: boolean) => {
    const result = calculateInvoiceLineTotal(item, {
      quantity,
      unit_price: unitPrice,
      discount_percentage: discountPercentage,
      tax_percentage: taxPercentage,
      tax_inclusive: taxInclusive,
    });

    return { lineTotal: result.lineTotal, taxAmount: result.taxAmount };
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
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, vatPercentage);
        return { ...item, tax_percentage: vatPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemVATInclusive = (itemId: string, vatInclusive: boolean) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newVatPercentage = vatInclusive ? (item.tax_percentage || defaultTaxRate) : item.tax_percentage;
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, newVatPercentage, vatInclusive);
        return { ...item, tax_inclusive: vatInclusive, tax_percentage: newVatPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const addItem = (product: any) => {
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      // Increase quantity if item already exists
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    const newItem: QuotationItem = {
      id: `temp-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      description: product.description || product.name,
      quantity: 1,
      unit_price: product.selling_price,
      discount_percentage: 0,
      tax_setting_id: null,
      tax_percentage: 0,
      tax_amount: 0,
      tax_inclusive: false,
      line_total: product.selling_price,
      batch_no: product.batch_no || '',
      expiry_date: product.expiry_date || null
    };

    setItems([...items, newItem]);
    setSearchProduct('');
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItemBatchNo = (itemId: string, batchNo: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return { ...item, batch_no: batchNo };
      }
      return item;
    }));
  };

  const updateItemExpiryDate = (itemId: string, expiryDate: string | null) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return { ...item, expiry_date: expiryDate };
      }
      return item;
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totals = calculateDocumentTotals(items);
  const subtotal = totals.subtotal;
  const taxAmount = totals.tax_total;
  const totalAmount = totals.total_amount;

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const normalizedItems = items.map(item => {
      const normalizedTaxPercentage = item.tax_inclusive ? item.tax_percentage : 0;
      const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, normalizedTaxPercentage, item.tax_inclusive);
      return { ...item, tax_percentage: normalizedTaxPercentage, tax_amount: taxAmount, line_total: lineTotal };
    });
    const normalizedSubtotal = normalizedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price) * (1 - item.discount_percentage / 100), 0);
    const normalizedTaxAmount = normalizedItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const normalizedTotalAmount = normalizedItems.reduce((sum, item) => sum + item.line_total, 0);

    setIsSubmitting(true);
    try {
      // Prepare quotation data
      const quotationData = {
        customer_id: selectedCustomerId,
        quotation_date: quotationDate,
        valid_until: validUntil,
        status: quotation.status || 'draft',
        notes: notes,
        terms_and_conditions: termsAndConditions,
        subtotal: normalizedSubtotal,
        tax_amount: normalizedTaxAmount,
        total_amount: normalizedTotalAmount,
      };

      // Prepare quotation items
      const quotationItems = normalizedItems.map(item => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage || 0,
        discount_before_vat: item.discount_before_vat ?? 0,
        tax_percentage: item.tax_percentage,
        tax_amount: item.tax_amount,
        tax_inclusive: item.tax_inclusive,
        line_total: item.line_total,
      }));

      // Call the update hook
      await updateQuotationWithItems.mutateAsync({
        quotationId: quotation.id,
        quotation: quotationData,
        items: quotationItems as any
      });

      toast.success(`Quotation ${quotation.quotation_number} updated successfully!`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating quotation:', error);

      let errorMessage = 'Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Handle Supabase error objects
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        } else if (supabaseError.hint) {
          errorMessage = supabaseError.hint;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      toast.error(`Failed to update quotation: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Edit Quotation {quotation?.quotation_number}</span>
          </DialogTitle>
          <DialogDescription>
            Update quotation details and items
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Quotation Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quotation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCustomers ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading customers...</div>
                      ) : (
                        customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.customer_code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quotation_date">Quotation Date *</Label>
                    <Input
                      id="quotation_date"
                      type="date"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes for this quotation..."
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

          {/* Right Column - Add Products and Summary */}
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
                      onChange={(e) => {
                        setSearchProduct(e.target.value);
                        setOptimizedSearchTerm(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Product List */}
                  {(searchProduct || (displayProducts && displayProducts.length > 0)) && (
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {loadingProducts || isSearching ? (
                        <div className="p-4 text-center text-muted-foreground">Loading products...</div>
                      ) : !displayProducts || displayProducts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No products found</div>
                      ) : (
                        displayProducts.map((product) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <div className="font-medium">{quotation?.customers?.name || 'Not selected'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <div className="font-medium">{items.length} items</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="ml-2">
                        {quotation?.status || 'Draft'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <div className="font-bold text-primary">{formatCurrency(totalAmount)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Items Display (Simplified for edit) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quotation Items</span>
              <Badge variant="outline">{items.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items in this quotation.
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
                          value={item.tax_percentage}
                          onChange={(e) => updateItemVAT(item.id, parseFloat(e.target.value) || 0)}
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
                          onCheckedChange={(checked) => updateItemVATInclusive(item.id, !!checked)}
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
                          className="w-28"
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
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedCustomerId}>
            <Calculator className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Quotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
