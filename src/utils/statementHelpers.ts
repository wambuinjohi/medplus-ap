import { supabase } from '@/integrations/supabase/client';

export type StatementDateRange = 'all_time' | 'last_30_days' | 'last_90_days' | 'this_year' | 'custom';

export interface StatementDateFilter {
  range: StatementDateRange | string;
  startDate?: string;
  endDate?: string;
}

export interface CreditNoteAllocationForStatement {
  id: string;
  credit_note_id: string;
  invoice_id: string;
  allocated_amount: number;
  allocation_date: string;
  notes?: string | null;
  credit_notes?: {
    credit_note_number: string;
    credit_note_date: string;
    customer_id?: string;
    reason?: string | null;
  } | null;
  invoices?: {
    invoice_number: string;
  } | null;
}

const toLocalDate = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`);

export const isStatementDateInRange = (date: string | null | undefined, filter: StatementDateFilter): boolean => {
  if (!date || filter.range === 'all_time') return Boolean(date);

  const transactionDate = toLocalDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter.range === 'last_30_days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return transactionDate >= start && transactionDate <= today;
  }

  if (filter.range === 'last_90_days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 90);
    return transactionDate >= start && transactionDate <= today;
  }

  if (filter.range === 'this_year') {
    return transactionDate.getFullYear() === today.getFullYear();
  }

  if (filter.range === 'custom') {
    const start = filter.startDate ? toLocalDate(filter.startDate) : undefined;
    const end = filter.endDate ? toLocalDate(filter.endDate) : undefined;
    return (!start || transactionDate >= start) && (!end || transactionDate <= end);
  }

  return true;
};

export const getStatementDateRangeLabel = (filter: StatementDateFilter): string => {
  if (filter.range === 'last_30_days') return 'Last 30 days';
  if (filter.range === 'last_90_days') return 'Last 90 days';
  if (filter.range === 'this_year') return 'This year';
  if (filter.range === 'custom') {
    if (filter.startDate && filter.endDate) return `${filter.startDate} to ${filter.endDate}`;
    if (filter.startDate) return `From ${filter.startDate}`;
    if (filter.endDate) return `Through ${filter.endDate}`;
  }
  return 'All time';
};

const fetchStatementAllocations = async (
  filter: StatementDateFilter,
  customerId?: string,
  companyId?: string
): Promise<CreditNoteAllocationForStatement[]> => {
  let query = supabase
    .from('credit_note_allocations')
    .select(`
      id,
      credit_note_id,
      invoice_id,
      allocated_amount,
      allocation_date,
      notes,
      credit_notes!inner (credit_note_number, credit_note_date, reason, customer_id, company_id),
      invoices!invoice_id (invoice_number)
    `)
    .order('allocation_date', { ascending: true });

  if (customerId) query = query.eq('credit_notes.customer_id', customerId);
  if (companyId) query = query.eq('credit_notes.company_id', companyId);

  const { data, error } = await query;
  if (error) throw error;

  return ((data || []) as CreditNoteAllocationForStatement[]).filter(allocation =>
    isStatementDateInRange(allocation.allocation_date, filter)
  );
};

export const fetchCustomerCreditNoteAllocations = (customerId: string, filter: StatementDateFilter = { range: 'all_time' }) =>
  fetchStatementAllocations(filter, customerId);

export const fetchCompanyCreditNoteAllocations = (companyId: string | undefined, filter: StatementDateFilter = { range: 'all_time' }) =>
  companyId ? fetchStatementAllocations(filter, undefined, companyId) : Promise.resolve([]);
