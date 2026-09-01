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
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { useCustomers, useProducts, useTaxSettings } from '@/hooks/useDatabase';
import { useUpdateInvoiceWithItems } from '@/hooks/useQuotationItems';
import { useCustomerCreditStatus } from '@/hooks/useCustomerCreditStatus';
import { useCurrentCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { getTermsAndConditions } from '@/utils/termsManager';
import { calculateInvoiceLineTotal, calculateInvoiceTotals } from '@/utils/taxCalculation';

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  discount_before_vat?: number;
  tax_percentage: number;
  tax_amount: number;
  tax_inclusive: boolean;
  line_total: number;
  batch_no?: string;
  expiry_date?: string | null;
}

interface EditInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  invoice: any;
}

export function EditInvoiceModal({ open, onOpenChange, onSuccess, invoice }: EditInvoiceModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lpoNumber, setLpoNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(getTermsAndConditions());

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentCompany } = useCurrentCompany();
  const { data: customers, isLoading: loadingCustomers } = useCustomers(currentCompany?.id);
  const { data: products, isLoading: loadingProducts } = useProducts(currentCompany?.id);
  const { data: taxSettings } = useTaxSettings(currentCompany?.id);
  const updateInvoiceWithItems = useUpdateInvoiceWithItems();
  const { data: creditStatus } = useCustomerCreditStatus(selectedCustomerId || invoice?.customer_id, currentCompany?.id);

  // Get default tax rate
  const defaultTax = taxSettings?.find(tax => tax.is_default && tax.is_active);
  const defaultTaxRate = defaultTax?.rate ?? 0;

  // Load invoice data when modal opens
  useEffect(() => {
    if (invoice && open) {
      setSelectedCustomerId(invoice.customer_id || '');
      setInvoiceDate(invoice.invoice_date || '');
      setDueDate(invoice.due_date || '');
      setLpoNumber(invoice.lpo_number || '');
      setNotes(invoice.notes || '');
      setTermsAndConditions(invoice.terms_and_conditions || getTermsAndConditions());

      const invoiceItems = (invoice.invoice_items || []).map((item: any, index: number) => ({
        id: item.id || `existing-${index}`,
        product_id: item.product_id || '',
        product_name: item.products?.name || 'Unknown Product',
        description: item.description || '',
        quantity: item.quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        discount_percentage: item.discount_percentage,
        discount_before_vat: item.discount_before_vat ?? 0,
        tax_percentage: item.tax_inclusive === true ? (item.tax_percentage ?? 0) : 0,
        tax_amount: item.tax_inclusive === true ? (item.tax_amount ?? 0) : 0,
        tax_inclusive: item.tax_inclusive === true,
        line_total: item.line_total ?? 0,
        batch_no: item.batch_no || '',
        expiry_date: item.expiry_date || null,
      }));
      const invoiceItems = (invoice.invoice_items || []).map((item: any, index: number) => {
        const normalizedItem: InvoiceItem = {
          id: item.id || `existing-${index}`,
          product_id: item.product_id || '',
          product_name: item.products?.name || 'Unknown Product',
          description: item.description || '',
          quantity: Number(item.quantity ?? 0),
          unit_price: Number(item.unit_price ?? 0),
          discount_percentage: Number(item.discount_percentage ?? 0),
          discount_before_vat: Number(item.discount_before_vat ?? 0),
          tax_percentage: Number(item.tax_percentage ?? 0),
          tax_amount: 0,
          tax_inclusive: Boolean(item.tax_inclusive),
          line_total: 0,
          batch_no: item.batch_no || '',
          expiry_date: item.expiry_date || null,
        };
        const calculated = calculateInvoiceLineTotal(normalizedItem);
        return {
          ...normalizedItem,
          tax_amount: calculated.taxAmount,
          line_total: calculated.lineTotal,
        };
      });

      setItems(invoiceItems.map((item: InvoiceItem) => {
        const normalizedTaxPercentage = item.tax_inclusive ? item.tax_percentage : 0;
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, normalizedTaxPercentage, item.tax_inclusive);
        return { ...item, tax_percentage: normalizedTaxPercentage, tax_amount: taxAmount, line_total: lineTotal };
      }));
    }
  }, [invoice, open]);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchProduct.toLowerCase())
  ) || [];

  const calculateLineTotal = (item: InvoiceItem, quantity?: number, unitPrice?: number, discountPercentage?: number, taxPercentage?: number, taxInclusive?: boolean) => {
    const qty = quantity ?? item.quantity;
    const price = unitPrice ?? item.unit_price;
    const discount = discountPercentage ?? item.discount_before_vat ?? item.discount_percentage ?? 0;
    const inclusive = taxInclusive ?? item.tax_inclusive;
    const tax = inclusive ? (taxPercentage ?? item.tax_percentage) : 0;

    const subtotal = qty * price;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;

    let taxAmount = 0;
    let lineTotal = 0;

    if (tax === 0) {
      // No VAT applied
      lineTotal = afterDiscount;
      taxAmount = 0;
    } else {
      // Both inclusive and exclusive now add VAT on top
      taxAmount = afterDiscount * (tax / 100);
      lineTotal = afterDiscount + taxAmount;
    }

    return { lineTotal, taxAmount };
  const calculateLineTotal = (
    item: InvoiceItem,
    quantity?: number,
    unitPrice?: number,
    discountPercentage?: number,
    taxPercentage?: number,
    taxInclusive?: boolean,
    discountBeforeVat?: number,
  ) => {
    const result = calculateInvoiceLineTotal(item, {
      quantity,
      unit_price: unitPrice,
      discount_percentage: discountPercentage,
      tax_percentage: taxPercentage,
      tax_inclusive: taxInclusive,
      discount_before_vat: discountBeforeVat,
    });
    return { lineTotal: result.lineTotal, taxAmount: result.taxAmount };
  };

  const addItem = (product: any) => {
    const existingItem = items.find(item => item.product_id === product.id);
    
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      description: product.description || product.name,
      quantity: 1,
      unit_price: product.selling_price,
      discount_percentage: 0,
      discount_before_vat: 0,
      tax_percentage: 0,
      tax_amount: 0,
      tax_inclusive: false,
      line_total: product.selling_price,
      batch_no: product.batch_no || '',
      expiry_date: product.expiry_date || null
    };

    const { lineTotal, taxAmount } = calculateLineTotal(newItem);
    newItem.line_total = lineTotal;
    newItem.tax_amount = taxAmount;

    setItems([...items, newItem]);
    setSearchProduct('');
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

  const updateItemDiscount = (itemId: string, discountPercentage: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, discountPercentage);
        return { ...item, discount_percentage: discountPercentage, line_total: lineTotal, tax_amount: taxAmount };
      }
      return item;
    }));
  };

  const updateItemDiscountBeforeVat = (itemId: string, discountBeforeVat: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, discountBeforeVat);
        const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, undefined, undefined, discountBeforeVat);
        return { ...item, discount_before_vat: discountBeforeVat, line_total: lineTotal, tax_amount: taxAmount };
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
    // Always use base amount for subtotal (unit price × quantity × discount)
    // VAT is calculated separately and added for exclusive, or extracted for inclusive
    const discount = item.discount_before_vat ?? item.discount_percentage ?? 0;
    const itemSubtotal = (item.quantity * item.unit_price) * (1 - discount / 100);
    return sum + itemSubtotal;
  }, 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0);
  const balanceDue = totalAmount - (invoice?.paid_amount || 0);
  const calculatedTotals = calculateInvoiceTotals(items);
  const subtotal = calculatedTotals.subtotal;
  const taxAmount = calculatedTotals.taxAmount;
  const totalAmount = calculatedTotals.totalAmount;
  const balanceDue = Math.max(0, totalAmount - Number(invoice?.paid_amount ?? 0));
  const canEditInvoice = invoice?.status !== 'paid' && !(
    Number(invoice?.paid_amount ?? 0) > 0 && Number(invoice?.balance_due ?? 0) <= 0
  );

  const handleSubmit = async () => {
    if (!canEditInvoice) {
      toast.error('Paid invoices cannot be edited');
      return;
    }
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Credit limit check (only if total is increasing beyond original)
    if (creditStatus && creditStatus.credit_limit > 0) {
      const originalBalance = invoice?.balance_due || 0;
      const newBalance = totalAmount - (invoice?.paid_amount || 0);
      const effectiveOutstanding = creditStatus.total_outstanding - originalBalance;
      if (effectiveOutstanding + newBalance > creditStatus.credit_limit && !creditStatus.allow_credit_beyond_limit) {
        toast.error('Updated invoice exceeds credit limit. Admin must enable credit override for this account.');
        return;
      }
    }

    const normalizedItems = items.map(item => {
      const normalizedTaxPercentage = item.tax_inclusive ? item.tax_percentage : 0;
      const { lineTotal, taxAmount } = calculateLineTotal(item, undefined, undefined, undefined, normalizedTaxPercentage, item.tax_inclusive);
      return { ...item, tax_percentage: normalizedTaxPercentage, tax_amount: taxAmount, line_total: lineTotal };
    });
    const normalizedSubtotal = normalizedItems.reduce((sum, item) => {
      const discount = item.discount_before_vat ?? item.discount_percentage ?? 0;
      return sum + (item.quantity * item.unit_price) * (1 - discount / 100);
    }, 0);
    const normalizedTaxAmount = normalizedItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const normalizedTotalAmount = normalizedItems.reduce((sum, item) => sum + item.line_total, 0);
    const normalizedBalanceDue = normalizedTotalAmount - (invoice?.paid_amount || 0);

    setIsSubmitting(true);
    try {
      const invoiceData = {
        customer_id: selectedCustomerId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        lpo_number: lpoNumber || null,
        subtotal: normalizedSubtotal,
        tax_amount: normalizedTaxAmount,
        total_amount: normalizedTotalAmount,
        balance_due: normalizedBalanceDue,
        terms_and_conditions: termsAndConditions,
        notes: notes,
      };

      const invoiceItems = normalizedItems.map(item => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        discount_before_vat: item.discount_before_vat ?? 0,
        tax_percentage: item.tax_percentage,
        tax_amount: item.tax_amount,
        tax_inclusive: item.tax_inclusive,
        line_total: item.line_total,
        batch_no: item.batch_no || 'N/A',
        expiry_date: item.expiry_date || null
      }));

      await updateInvoiceWithItems.mutateAsync({
        invoiceId: invoice.id,
        invoice: invoiceData,
        items: invoiceItems
      });

      toast.success(`Invoice ${invoice.invoice_number} updated successfully!`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span>Edit Invoice {invoice?.invoice_number}</span>
          </DialogTitle>
          <DialogDescription>
            Update invoice details and items
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
                    <TableHead>Discount %</TableHead>
                    <TableHead>Disc. Before VAT</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead>Tax Incl.</TableHead>
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
                          value={item.discount_percentage}
                          onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                          max="100"
                          step="0.1"
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
                      <span>Paid:</span>
                      <span>{formatCurrency(invoice?.paid_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-2">
                      <span className="font-bold">Balance Due:</span>
                      <span className="font-bold text-destructive">{formatCurrency(balanceDue)}</span>
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
          {(() => {
            const originalBalance = invoice?.balance_due || 0;
            const newBalance = totalAmount - (invoice?.paid_amount || 0);
            const effectiveOutstanding = creditStatus ? creditStatus.total_outstanding - originalBalance : 0;
            const creditExceeded = creditStatus && creditStatus.credit_limit > 0 &&
              effectiveOutstanding + newBalance > creditStatus.credit_limit &&
              !creditStatus.allow_credit_beyond_limit;
            return (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canEditInvoice || !selectedCustomerId || items.length === 0 || creditExceeded}
                variant={creditExceeded ? 'destructive' : 'default'}
              >
                {creditExceeded ? (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Updating...' : creditExceeded ? 'Credit Limit Exceeded' : 'Update Invoice'}
              </Button>
            );
          })()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
