import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Customer {
  id: string;
  name: string;
  customer_code: string;
}

interface SearchableCustomerSelectProps {
  customers: Customer[];
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function SearchableCustomerSelect({
  customers = [],
  isLoading,
  value,
  onChange,
  label = 'Customer',
  required = true,
  placeholder = 'Search and select a customer...'
}: SearchableCustomerSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customerId: string) => {
    onChange(customerId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full px-3 py-2 border rounded-md bg-white cursor-pointer flex items-center justify-between min-h-10 hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            {selectedCustomer ? (
              <div className="flex-1">
                <div className="font-medium text-sm">{selectedCustomer.name}</div>
                <div className="text-xs text-muted-foreground">{selectedCustomer.customer_code}</div>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </div>
          {selectedCustomer && (
            <button
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-muted rounded transition-colors"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
            <div className="p-2 border-b sticky top-0 bg-white">
              <Input
                autoFocus
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-muted-foreground text-sm">
                  Loading customers...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground text-sm">
                  {customers.length === 0 ? 'No customers available' : 'No customers found'}
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                      </div>
                      {value === customer.id && (
                        <Badge variant="secondary" className="ml-2">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
