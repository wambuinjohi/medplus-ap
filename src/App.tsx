import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigate, Routes, Route, useParams } from "react-router-dom";
import { enableResizeObserverErrorSuppression } from "@/utils/resizeObserverErrorHandler";
import { lazy, Suspense, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { addStructuredData, generateOrganizationSchema } from "@/utils/seoHelpers";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
const Landing = lazy(() => import("./pages/Landing"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const OurProducts = lazy(() => import("./pages/OurProducts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Media = lazy(() => import("./pages/Media"));
const Offers = lazy(() => import("./pages/Offers"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Index = lazy(() => import("./pages/Index"));
const Quotations = lazy(() => import("./pages/Quotations"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Payments = lazy(() => import("./pages/Payments"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Customers = lazy(() => import("./pages/Customers"));
const DeliveryNotes = lazy(() => import("./pages/DeliveryNotes"));
const Proforma = lazy(() => import("./pages/Proforma"));
const SalesReports = lazy(() => import("./pages/reports/SalesReports"));
const HistoricalProductSales = lazy(() => import("./pages/reports/HistoricalProductSales"));
const InventoryReports = lazy(() => import("./pages/reports/InventoryReports"));
const StatementOfAccounts = lazy(() => import("./pages/reports/StatementOfAccounts"));
const CompanySettings = lazy(() => import("./pages/settings/CompanySettings"));
const UserManagement = lazy(() => import("./pages/settings/UserManagement"));
const TermsAndConditionsSettings = lazy(() => import("./pages/settings/TermsAndConditionsSettings"));
const RemittanceAdvice = lazy(() => import("./pages/RemittanceAdvice"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const LPOs = lazy(() => import("./pages/LPOs"));
const CreditNotes = lazy(() => import("./pages/CreditNotes"));
const WebManager = lazy(() => import("./pages/WebManager"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentSynchronizationPage = lazy(() => import("./pages/PaymentSynchronization"));
const OptimizedInventory = lazy(() => import("./pages/OptimizedInventory"));
const PerformanceOptimizerPage = lazy(() => import("./pages/PerformanceOptimizerPage"));
const OptimizedCustomers = lazy(() => import("./pages/OptimizedCustomers"));
const CustomerPerformanceOptimizerPage = lazy(() => import("./pages/CustomerPerformanceOptimizerPage"));
const SetupAndTest = lazy(() => import("./components/SetupAndTest"));
const AuthTest = lazy(() => import("./components/AuthTest"));

const ProductAliasRedirect = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  return <Navigate to={`/products/${productSlug}`} replace />;
};

const App = () => {

  useEffect(() => {
    // Suppress ResizeObserver loop errors
    enableResizeObserverErrorSuppression();

    // Add global Organization schema for SEO
    addStructuredData(generateOrganizationSchema());

  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Layout>
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          }
        >
          <Routes>
          {/* Public Website Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/products" element={<OurProducts />} />
          <Route path="/products/:productSlug" element={<ProductDetail />} />
          <Route path="/product/:productSlug" element={<ProductAliasRedirect />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/media" element={<Media />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />

          {/* App Routes - Protected */}
          {/* Dashboard */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />

          {/* Sales & Customer Management */}
          <Route
            path="/app/quotations"
            element={
              <ProtectedRoute>
                <Quotations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/quotations/new"
            element={
              <ProtectedRoute>
                <Quotations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/customers/new"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* Financial Management */}
          <Route
            path="/app/invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/invoices/new"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
          <Route path="/invoices/new" element={<Navigate to="/app/invoices/new" replace />} />
          <Route
            path="/app/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/payments/new"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/credit-notes"
            element={
              <ProtectedRoute>
                <CreditNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/credit-notes/new"
            element={
              <ProtectedRoute>
                <CreditNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/proforma"
            element={
              <ProtectedRoute>
                <Proforma />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/admin/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Procurement & Inventory */}
          <Route
            path="/app/lpos"
            element={
              <ProtectedRoute>
                <LPOs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/lpos/new"
            element={
              <ProtectedRoute>
                <LPOs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/inventory/new"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/delivery-notes"
            element={
              <ProtectedRoute>
                <DeliveryNotes />
              </ProtectedRoute>
            }
          />

          {/* Additional Features */}
          <Route
            path="/app/remittance"
            element={
              <ProtectedRoute>
                <RemittanceAdvice />
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/app/reports/sales"
            element={
              <ProtectedRoute>
                <SalesReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/reports/sales-by-product"
            element={
              <ProtectedRoute>
                <HistoricalProductSales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/reports/inventory"
            element={
              <ProtectedRoute>
                <InventoryReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/reports/statements"
            element={
              <ProtectedRoute>
                <StatementOfAccounts />
              </ProtectedRoute>
            }
          />

          {/* Web Manager */}
          <Route
            path="/app/web-manager"
            element={
              <ProtectedRoute requiredRole="admin">
                <WebManager />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/app/settings/company"
            element={
              <ProtectedRoute>
                <CompanySettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings/terms"
            element={
              <ProtectedRoute>
                <TermsAndConditionsSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/setup-test"
            element={
              <ProtectedRoute>
                <SetupAndTest />
              </ProtectedRoute>
            }
          />

          {/* Authentication Test - No protection needed */}
          <Route path="/auth-test" element={<AuthTest />} />


          {/* Payment Synchronization - No protection needed for setup */}
          <Route path="/payment-sync" element={<PaymentSynchronizationPage />} />


          {/* Optimized Inventory - Performance-optimized inventory page */}
          <Route
            path="/app/optimized-inventory"
            element={
              <ProtectedRoute>
                <OptimizedInventory />
              </ProtectedRoute>
            }
          />

          {/* Performance Optimizer - Database and inventory performance optimization */}
          <Route path="/app/performance-optimizer" element={<PerformanceOptimizerPage />} />


          {/* Optimized Customers - Performance-optimized customers page */}
          <Route
            path="/app/optimized-customers"
            element={
              <ProtectedRoute>
                <OptimizedCustomers />
              </ProtectedRoute>
            }
          />

          {/* Customer Performance Optimizer - Database and customer performance optimization */}
          <Route path="/app/customer-performance-optimizer" element={<CustomerPerformanceOptimizerPage />} />




          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </TooltipProvider>
  );
};

export default App;
