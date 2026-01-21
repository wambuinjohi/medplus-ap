import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Building2,
  FileText,
  Receipt,
  Package,
  DollarSign,
  Truck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  FileCheck,
  CreditCard,
  FileSpreadsheet,
  ShoppingCart,
  RotateCcw,
  Globe
} from 'lucide-react';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: SidebarItem[];
  allowedRoles?: string[]; // Roles that can see this item
  requiredPermission?: 'view_quotation' | 'view_invoice' | 'view_credit_note' | 'view_proforma' | 'view_customer' | 'view_inventory' | 'view_delivery_note' | 'view_lpo' | 'view_remittance' | 'view_payment' | 'view_reports' | 'manage_roles' | 'access_settings'; // Permission required to see this item
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/app'
  },
  {
    title: 'Sales',
    icon: Receipt,
    children: [
      { title: 'Quotations', icon: FileText, href: '/app/quotations', requiredPermission: 'view_quotation' },
      { title: 'Proforma Invoices', icon: FileCheck, href: '/app/proforma', requiredPermission: 'view_proforma' },
      { title: 'Invoices', icon: Receipt, href: '/app/invoices', requiredPermission: 'view_invoice' },
      { title: 'Credit Notes', icon: RotateCcw, href: '/app/credit-notes', requiredPermission: 'view_credit_note' }
    ]
  },
  {
    title: 'Payments',
    icon: DollarSign,
    children: [
      { title: 'Payments', icon: DollarSign, href: '/app/payments', requiredPermission: 'view_payment' },
      { title: 'Remittance Advice', icon: CreditCard, href: '/app/remittance', requiredPermission: 'view_remittance' }
    ]
  },
  {
    title: 'Inventory',
    icon: Package,
    href: '/app/inventory',
    requiredPermission: 'view_inventory'
  },
  {
    title: 'Delivery Notes',
    icon: Truck,
    children: [
      { title: 'Delivery Notes', icon: Truck, href: '/app/delivery-notes', requiredPermission: 'view_delivery_note' }
    ]
  },
  {
    title: 'Customers',
    icon: Users,
    href: '/app/customers',
    requiredPermission: 'view_customer'
  },
  {
    title: 'Purchase Orders',
    icon: ShoppingCart,
    href: '/app/lpos',
    requiredPermission: 'view_lpo'
  },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      { title: 'Sales Reports', icon: BarChart3, href: '/app/reports/sales' },
      { title: 'Inventory Reports', icon: Package, href: '/app/reports/inventory', allowedRoles: ['admin', 'stock_manager'] },
      { title: 'Customer Statements', icon: FileSpreadsheet, href: '/app/reports/statements' }
    ]
  },
  {
    title: 'Web Manager',
    icon: Globe,
    allowedRoles: ['admin'],
    href: '/app/web-manager'
  },
  {
    title: 'Settings',
    icon: Settings,
    allowedRoles: ['admin'],
    children: [
      { title: 'Company Settings', icon: Building2, href: '/app/settings/company' },
      { title: 'User Management', icon: Users, href: '/app/settings/users' },
      { title: 'Terms & Conditions', icon: FileText, href: '/app/settings/terms' },
      { title: 'Database Setup', icon: Package, href: '/database-setup' }
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemVisible = (item: SidebarItem): boolean => {
    // If no allowed roles specified, item is visible to everyone
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    // Check if user's role is in allowed roles
    return item.allowedRoles.includes(profile?.role || '');
  };

  const isItemActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const isParentActive = (children?: SidebarItem[]) => {
    if (!children) return false;
    return children.some(child => isItemActive(child.href));
  };

  const renderSidebarItem = (item: SidebarItem) => {
    // Don't render if not visible to current user
    if (!isItemVisible(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = isItemActive(item.href);
    const isChildActive = isParentActive(item.children);

    // Filter children based on visibility
    const visibleChildren = item.children?.filter(isItemVisible) || [];

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              (isChildActive || isExpanded) 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground"
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && visibleChildren.length > 0 && (
            <div className="pl-4 space-y-1">
              {visibleChildren.map(child => (
                <Link
                  key={child.title}
                  to={child.href!}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isItemActive(child.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground"
                  )}
                >
                  <child.icon className="h-4 w-4" />
                  <span>{child.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        to={item.href!}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground"
        )}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Company Logo/Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <BiolegendLogo size="md" showText={true} className="text-sidebar-foreground" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 custom-scrollbar overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item)).filter(Boolean)}
      </nav>

      {/* Company Info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2 text-sm text-sidebar-foreground">
            <Building2 className="h-4 w-4 text-sidebar-primary" />
            <div>
              <div className="font-medium text-sm">Medplus Africa</div>
              <div className="text-xs text-sidebar-foreground/60">Healthcare & Pharmaceuticals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
