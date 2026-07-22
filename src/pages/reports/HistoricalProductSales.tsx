import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  DollarSign,
  FileText,
  Lock,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCurrentCompanyId } from '@/contexts/CompanyContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/useDatabase';
import { useInvoicesFixed as useInvoices } from '@/hooks/useInvoicesFixed';

interface SaleRow {
  id: string;
  date: string;
  invoiceNumber: string;
  customer: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  lineTotal: number;
}

interface InvoiceItemRecord {
  id?: string;
  product_id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  discount_before_vat?: number;
  tax_amount?: number;
  line_total?: number;
  products?: { name?: string } | null;
}

interface InvoiceRecord {
  id: string;
  invoice_date: string;
  invoice_number?: string;
  customers?: { name?: string } | null;
  invoice_items?: InvoiceItemRecord[];
}

type SortKey = 'date' | 'unitPrice';

const formatCurrency = (value: number) => `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (value: string) => new Date(value).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

export default function HistoricalProductSales() {
  const companyId = useCurrentCompanyId();
  const { can: canViewReports, loading: permissionsLoading } = usePermissions();
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices(companyId);
  const { data: products, isLoading: productsLoading } = useProducts(companyId);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAscending, setSortAscending] = useState(false);

  const filteredRows = useMemo<SaleRow[]>(() => {
    if (!invoices) return [];
    const now = new Date();
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (dateRange === 'custom') {
      rangeStart = startDate ? new Date(`${startDate}T00:00:00`) : null;
      rangeEnd = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
    } else if (dateRange !== 'all_time') {
      rangeStart = new Date(now);
      const days = dateRange === 'last_7_days' ? 7 : dateRange === 'last_90_days' ? 90 : dateRange === 'this_year' ? null : 30;
      if (days) rangeStart.setDate(now.getDate() - days);
      else rangeStart = new Date(now.getFullYear(), 0, 1);
    }

    return (invoices as InvoiceRecord[]).flatMap((invoice) => {
      const invoiceDate = new Date(invoice.invoice_date);
      if (rangeStart && invoiceDate < rangeStart) return [];
      if (rangeEnd && invoiceDate > rangeEnd) return [];
      return (invoice.invoice_items || [])
        .filter((item) => productFilter === 'all' || item.product_id === productFilter)
        .map((item, index: number) => {
          const quantity = Number(item.quantity || 0);
          const unitPrice = Number(item.unit_price || 0);
          const lineTotal = Number(item.line_total ?? quantity * unitPrice);
          const discount = Number(item.discount_before_vat || 0);
          return {
            id: item.id || `${invoice.id}-${index}`,
            date: invoice.invoice_date,
            invoiceNumber: invoice.invoice_number || '—',
            customer: invoice.customers?.name || 'Unknown customer',
            product: item.products?.name || item.description || 'Unknown product',
            quantity,
            unitPrice,
            discount,
            tax: Number(item.tax_amount || 0),
            lineTotal,
          };
        });
    }).sort((a, b) => {
      const comparison = sortKey === 'date'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : a.unitPrice - b.unitPrice;
      return sortAscending ? comparison : -comparison;
    });
  }, [dateRange, endDate, invoices, productFilter, sortAscending, sortKey, startDate]);

  const summary = useMemo(() => ({
    quantity: filteredRows.reduce((sum, row) => sum + row.quantity, 0),
    sales: filteredRows.reduce((sum, row) => sum + row.lineTotal, 0),
    transactions: new Set(filteredRows.map(row => row.invoiceNumber)).size,
    averagePrice: filteredRows.length ? filteredRows.reduce((sum, row) => sum + row.unitPrice, 0) / filteredRows.length : 0,
    lowestPrice: filteredRows.length ? Math.min(...filteredRows.map(row => row.unitPrice)) : 0,
    highestPrice: filteredRows.length ? Math.max(...filteredRows.map(row => row.unitPrice)) : 0,
  }), [filteredRows]);

  const trendData = useMemo(() => {
    const grouped = new Map<string, { date: string; price: number; sales: number }>();
    filteredRows.forEach(row => {
      const key = row.date.slice(0, 10);
      const existing = grouped.get(key);
      grouped.set(key, {
        date: key,
        price: existing ? (existing.price + row.unitPrice) / 2 : row.unitPrice,
        sales: (existing?.sales || 0) + row.lineTotal,
      });
    });
    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date)).map(item => ({
      ...item,
      label: new Date(`${item.date}T00:00:00`).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }),
    }));
  }, [filteredRows]);

  const selectedProduct = products?.find(product => product.id === productFilter);
  const visibleProducts = (products || []).filter(product => product.name.toLowerCase().includes(productSearch.toLowerCase()));
  const isLoading = invoicesLoading || productsLoading;

  if (!permissionsLoading && !canViewReports('view_reports')) {
    return <Card><CardContent className="flex min-h-[360px] flex-col items-center justify-center text-center"><Lock className="mb-4 h-12 w-12 text-muted-foreground" /><h2 className="text-xl font-semibold">Access Denied</h2><p className="mt-2 text-muted-foreground">You do not have permission to view reports.</p></CardContent></Card>;
  }

  if (isLoading) return <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">Loading historical sales...</div>;
  if (invoicesError) return <div className="flex min-h-[400px] items-center justify-center text-destructive">Error loading historical sales data: {invoicesError.message}</div>;
  if (!companyId) return <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">Please select a company to view historical sales.</div>;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAscending(value => !value);
    else { setSortKey(key); setSortAscending(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historical Product Sales</h1>
        <p className="text-muted-foreground">Review the prices and details captured on every product sale.</p>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label>Date range</Label><Select value={dateRange} onValueChange={setDateRange}><SelectTrigger><Calendar className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="last_7_days">Last 7 days</SelectItem><SelectItem value="last_30_days">Last 30 days</SelectItem><SelectItem value="last_90_days">Last 90 days</SelectItem><SelectItem value="this_year">This year</SelectItem><SelectItem value="all_time">All time</SelectItem><SelectItem value="custom">Custom range</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Product</Label><Select value={productFilter} onValueChange={setProductFilter}><SelectTrigger><Package className="mr-2 h-4 w-4" /><SelectValue placeholder="All products" /></SelectTrigger><SelectContent><div className="p-2"><Input placeholder="Search products..." value={productSearch} onChange={event => setProductSearch(event.target.value)} /></div><SelectItem value="all">All products</SelectItem>{visibleProducts.map(product => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent></Select></div>
          {dateRange === 'custom' && <><div className="space-y-2"><Label htmlFor="historical-start">Start date</Label><Input id="historical-start" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="historical-end">End date</Label><Input id="historical-end" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} /></div></>}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[['Quantity sold', summary.quantity.toLocaleString(), ShoppingCart], ['Sales value', formatCurrency(summary.sales), DollarSign], ['Transactions', summary.transactions.toLocaleString(), FileText], ['Average price', formatCurrency(summary.averagePrice), TrendingUp], ['Price range', summary.lowestPrice ? `${formatCurrency(summary.lowestPrice)} – ${formatCurrency(summary.highestPrice)}` : '—', Package]].map(([label, value, Icon]) => <Card key={label as string}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div><Icon className="h-5 w-5 text-primary" /></div></CardContent></Card>)}
      </div>

      {productFilter !== 'all' && <Card><CardHeader><CardTitle>Historical price trend{selectedProduct ? ` · ${selectedProduct.name}` : ''}</CardTitle></CardHeader><CardContent>{trendData.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis tickFormatter={value => `${Number(value).toLocaleString()}`} /><Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'price' ? 'Unit price' : 'Sales']} /><Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer> : <p className="py-16 text-center text-muted-foreground">No sales found for this product in the selected range.</p>}</CardContent></Card>}

      <Card><CardHeader><CardTitle>{selectedProduct ? `${selectedProduct.name} sales details` : 'Sales details'} <span className="text-sm font-normal text-muted-foreground">({filteredRows.length} line items)</span></CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead><button className="flex items-center gap-1" onClick={() => toggleSort('date')}>Sale date {sortKey === 'date' && (sortAscending ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</button></TableHead><TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Qty</TableHead><TableHead><button className="flex items-center gap-1" onClick={() => toggleSort('unitPrice')}>Historical unit price {sortKey === 'unitPrice' && (sortAscending ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</button></TableHead><TableHead className="text-right">Discount</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Line total</TableHead></TableRow></TableHeader><TableBody>{filteredRows.map(row => <TableRow key={row.id}><TableCell>{formatDate(row.date)}</TableCell><TableCell className="font-medium">{row.invoiceNumber}</TableCell><TableCell>{row.customer}</TableCell><TableCell>{row.product}</TableCell><TableCell className="text-right">{row.quantity}</TableCell><TableCell>{formatCurrency(row.unitPrice)}</TableCell><TableCell className="text-right">{formatCurrency(row.discount)}</TableCell><TableCell className="text-right">{formatCurrency(row.tax)}</TableCell><TableCell className="text-right font-medium">{formatCurrency(row.lineTotal)}</TableCell></TableRow>)}</TableBody></Table></div>{!filteredRows.length && <div className="py-16 text-center"><Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="font-medium">No matching sales found</p><p className="mt-1 text-sm text-muted-foreground">Try widening the date range or selecting a different product.</p></div>}</CardContent></Card>
    </div>
  );
}
