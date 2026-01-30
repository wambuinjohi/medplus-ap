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
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: SidebarItem[];
  allowedRoles?: string[];
  requiredPermission?: 'view_quotation' | 'view_invoice' | 'view_credit_note' | 'view_proforma' | 'view_customer' | 'view_inventory' | 'view_delivery_note' | 'view_lpo' | 'view_remittance' | 'view_payment' | 'view_reports' | 'manage_roles' | 'access_settings';
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
      { title: 'Sales Reports', icon: BarChart3, href: '/app/reports/sales', requiredPermission: 'view_reports' },
      { title: 'Inventory Reports', icon: Package, href: '/app/reports/inventory', requiredPermission: 'view_reports' },
      { title: 'Customer Statements', icon: FileSpreadsheet, href: '/app/reports/statements', requiredPermission: 'view_reports' }
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
      { title: 'Company Settings', icon: Building2, href: '/app/settings/company', requiredPermission: 'access_settings' },
      { title: 'User Management', icon: Users, href: '/app/settings/users', requiredPermission: 'access_settings' },
      { title: 'Terms & Conditions', icon: FileText, href: '/app/settings/terms', requiredPermission: 'access_settings' },
      { title: 'Database Setup', icon: Package, href: '/database-setup', requiredPermission: 'access_settings' }
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { can } = usePermissions();
  const { setOpenMobile, isMobile } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemVisible = (item: SidebarItem): boolean => {
    if (item.requiredPermission && !can(item.requiredPermission)) {
      return false;
    }

    if (item.allowedRoles && item.allowedRoles.length > 0) {
      return item.allowedRoles.includes(profile?.role || '');
    }

    return true;
  };

  const isItemActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const isParentActive = (children?: SidebarItem[]) => {
    if (!children) return false;
    return children.some(child => isItemActive(child.href));
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderSidebarItem = (item: SidebarItem) => {
    if (!isItemVisible(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = isItemActive(item.href);
    const isChildActive = isParentActive(item.children);

    const visibleChildren = item.children?.filter(isItemVisible) || [];

    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.title}>
          <div>
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
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && visibleChildren.length > 0 && (
              <SidebarMenuSub>
                {visibleChildren.map(child => (
                  <SidebarMenuSubItem key={child.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isItemActive(child.href)}
                    >
                      <Link
                        to={child.href!}
                        className="flex items-center gap-2"
                        onClick={handleMenuItemClick}
                      >
                        <child.icon className="h-4 w-4" />
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </div>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.title}
        >
          <Link
            to={item.href!}
            className="flex items-center gap-2"
            onClick={handleMenuItemClick}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <BiolegendLogo size="md" showText={true} className="text-sidebar-foreground" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {sidebarItems.map(item => renderSidebarItem(item)).filter(Boolean)}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm text-sidebar-foreground">
          <Building2 className="h-4 w-4 text-sidebar-primary" />
          <div>
            <div className="font-medium text-sm">Medplus Africa</div>
            <div className="text-xs text-sidebar-foreground/60">Healthcare & Pharmaceuticals</div>
          </div>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
