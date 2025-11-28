import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import { PublicFooter } from '@/components/PublicFooter';
import ProductCategorySidebar from '@/components/ProductCategorySidebar';
import { useToast } from '@/hooks/use-toast';
import { getProductBySlug, getProductsByCategory } from '@/data/products';
import { productCategoryNames } from '@/data/categories';
import { MessageCircle, ArrowLeft, Check } from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useSEO } from '@/hooks/useSEO';
import { generateProductSchema, SITE_CONFIG } from '@/utils/seoHelpers';

export default function ProductDetail() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const product = productSlug ? getProductBySlug(productSlug) : undefined;
  const categoryProducts = productSlug ? getProductsByCategory(productSlug) : [];
  const isCategory = categoryProducts.length > 0;
  const categoryName = isCategory && categoryProducts.length > 0 ? categoryProducts[0].category : undefined;

  // Set SEO for product
  useSEO(
    {
      title: product?.name || categoryName || 'Product',
      description: product?.description || `Browse our ${categoryName} collection`,
      keywords: `${product?.name || categoryName}, medical supplies, healthcare`,
      url: `${SITE_CONFIG.url}/products/${productSlug}`,
      type: isCategory ? 'website' : 'product',
      image: product?.image || (categoryProducts[0]?.image),
    },
    product && !isCategory ? generateProductSchema({
      name: product.name,
      description: product.description,
      image: product.image,
      url: `${SITE_CONFIG.url}/products/${productSlug}`,
      category: product.category,
    }) : undefined
  );

  const [quotationForm, setQuotationForm] = useState({
    quantity: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    additionalNotes: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuotationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendToWhatsApp = () => {
    if (!quotationForm.quantity || !quotationForm.companyName || !quotationForm.email || !quotationForm.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before sending.",
        variant: "destructive"
      });
      return;
    }

    const message = `*Product Quotation Request*
━━━━━━━━━━━━━━━━━━━━━━

*Product:*
${product?.name}

*Customer Details:*
Company: ${quotationForm.companyName}
Contact Person: ${quotationForm.contactPerson || 'N/A'}
Email: ${quotationForm.email}
Phone: ${quotationForm.phone}

*Order Details:*
Quantity: ${quotationForm.quantity} ${product?.pricing.unit || 'units'}
${quotationForm.additionalNotes ? `Additional Notes: ${quotationForm.additionalNotes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
Please provide a quotation for the above product and delivery terms.`;

    const whatsappPhone = '+254734785363';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: "Success!",
      description: "Opening WhatsApp. Please complete your message and send.",
    });

    setQuotationForm({
      quantity: '',
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      additionalNotes: ''
    });
  };

  if (!product && !isCategory) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex-shrink-0">
                <BiolegendLogo size="md" showText={true} />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">Home</Link>
                <Link to="/about-us" className="text-gray-700 hover:text-primary transition-colors font-medium">About Us</Link>
                <Link to="/products" className="text-gray-700 hover:text-primary transition-colors font-medium">Our Products</Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors font-medium">Contact Us</Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">
                <ArrowLeft size={16} className="mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render category view
  if (isCategory) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex-shrink-0">
                <BiolegendLogo size="md" showText={true} />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">Home</Link>
                <Link to="/about-us" className="text-gray-700 hover:text-primary transition-colors font-medium">About Us</Link>
                <Link to="/products" className="text-gray-700 hover:text-primary transition-colors font-medium">Our Products</Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors font-medium">Contact Us</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <BreadcrumbNav items={[
          { label: 'Products', href: '/products' },
          { label: categoryName || 'Category', href: `/products/${productSlug}` }
        ]} />

        {/* Category Products Grid */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
              <p className="text-lg text-gray-600">Browse our collection of {categoryName?.toLowerCase()} products</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* SKU */}
                    {prod.sku && (
                      <p className="text-xs text-gray-500 font-semibold mb-2">SKU: {prod.sku}</p>
                    )}

                    {/* Product Name */}
                    <h3 className="text-base font-bold text-gray-900 mb-4 line-clamp-2">
                      {prod.name}
                    </h3>

                    {/* Request Quotation Button */}
                    <button
                      onClick={() => {
                        const message = `Hi, I'm interested in requesting a quotation for: ${prod.name} (SKU: ${prod.sku}). Could you please provide pricing and availability details?`;
                        const encodedMessage = encodeURIComponent(message);
                        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Request Quotation
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <PublicFooter productCategories={productCategoryNames} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex-shrink-0">
              <BiolegendLogo size="md" showText={true} />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">Home</Link>
              <Link to="/about-us" className="text-gray-700 hover:text-primary transition-colors font-medium">About Us</Link>
              <Link to="/products" className="text-gray-700 hover:text-primary transition-colors font-medium">Our Products</Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors font-medium">Contact Us</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <BreadcrumbNav items={[
        { label: 'Products', href: '/products' },
        { label: product.name, href: `/products/${productSlug}` }
      ]} />

      {/* Product Details with Sidebar */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <ProductCategorySidebar
              categories={[
                { name: 'Bandages, Tapes and Dressings' },
                { name: 'Bottles and Containers' },
                { name: 'Catheters and Tubes' },
                { name: 'Cotton Wool' },
                { name: 'Diapers and Sanitary' },
                { name: 'Gloves' },
                { name: 'Hospital Equipments' },
                { name: 'Hospital Furniture' },
                { name: 'Hospital Instruments' },
                { name: 'Hospital Linen' },
                { name: 'Infection Control' },
                { name: 'Others' },
                { name: 'PPE' },
                { name: 'Spirits, Detergents and Disinfectants' },
                { name: 'Syringes and Needles' },
              ]}
              activeCategory={product.name}
            />

            {/* Main Content */}
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Product Image */}
                <div>
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-lg text-gray-600 mb-6">{product.description}</p>


                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Full Description & Specs */}
              <div className="grid md:grid-cols-2 gap-12 mt-16">
                {/* Description */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Product</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">{product.longDescription}</p>
                </div>

                {/* Specifications */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                  <div className="space-y-4">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="border-b border-gray-200 pb-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{spec.label}</h4>
                        <p className="text-gray-600">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quotation Form */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Request a Quotation</h2>
          <p className="text-gray-600 text-center mb-12">Fill in the details below and we'll send you a quotation via WhatsApp</p>

          <form className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6 scroll-smooth" style={{ scrollBehavior: 'auto' }}>
            {/* Category Name Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-semibold">Category</p>
              <p className="text-lg text-blue-900 font-bold">{product.name}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <Label htmlFor="quantity" className="text-gray-700 mb-2 block">
                  Quantity * <span className="text-xs text-gray-500">({product.pricing.unit})</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={quotationForm.quantity}
                  onChange={handleFormChange}
                  autoComplete="off"
                  placeholder="e.g., 50"
                  required
                  className="mt-1"
                />
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="companyName" className="text-gray-700 mb-2 block">
                  Company/Institution Name *
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={quotationForm.companyName}
                  onChange={handleFormChange}
                  autoComplete="organization"
                  placeholder="Your organization name"
                  required
                  className="mt-1"
                />
              </div>

              {/* Contact Person */}
              <div>
                <Label htmlFor="contactPerson" className="text-gray-700 mb-2 block">
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={quotationForm.contactPerson}
                  onChange={handleFormChange}
                  autoComplete="name"
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-gray-700 mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={quotationForm.email}
                  onChange={handleFormChange}
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-gray-700 mb-2 block">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={quotationForm.phone}
                  onChange={handleFormChange}
                  autoComplete="tel"
                  placeholder="+254 XXX XXX XXX"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="additionalNotes" className="text-gray-700 mb-2 block">
                Additional Notes or Special Requirements
              </Label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={quotationForm.additionalNotes}
                onChange={handleFormChange}
                autoComplete="off"
                rows={4}
                placeholder="Any special requirements or additional information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={sendToWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Send via WhatsApp
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/products')}
                variant="outline"
                className="flex-1 py-3"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Products
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Required fields. Your information will be used only for quotation purposes.
            </p>
          </form>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Need Help?</h2>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
            <p className="text-gray-700 mb-4">
              Have questions about this product or need more information?
            </p>
            <p className="text-gray-600 mb-6">
              Sales Email: <a href="mailto:sales@medplusafrica.com" className="text-primary hover:underline font-semibold">sales@medplusafrica.com</a><br />
              Phone: <a href="tel:+254734785363" className="text-primary hover:underline font-semibold">+254 734 785 363</a>
            </p>
            <Link to="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter productCategories={productCategoryNames} />
    </div>
  );
}
