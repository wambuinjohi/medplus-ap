import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Bandage, Package, Pipette, Wind, Baby, Hand, Monitor, Sofa, Wrench, Shirt, Shield, MoreHorizontal, Droplet, Syringe, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import HeroSlider from '@/components/HeroSlider';
import ProductsSection from '@/components/ProductsSection';
import { getProductBySlug } from '@/data/products';
import { useSEO } from '@/hooks/useSEO';
import { generateOrganizationSchema } from '@/utils/seoHelpers';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useSEO(
    {
      title: 'Home - Medical Supplies & Hospital Equipment',
      description: 'Medplus Africa - Trusted distributor of critical care supplies, hospital consumables, and furniture. Over 10 years of serving healthcare facilities across Africa.',
      keywords: 'medical supplies, hospital equipment, critical care, healthcare distributor, Africa',
      url: 'https://medplusafrica.com/',
    },
    generateOrganizationSchema()
  );

  const productIconMap: { [key: string]: React.ReactNode } = {
    'Bandages, Tapes and Dressings': <Bandage size={24} className="text-red-500" />,
    'Bottles and Containers': <Package size={24} className="text-blue-600" />,
    'Catheters and Tubes': <Pipette size={24} className="text-purple-600" />,
    'Cotton Wool': <Wind size={24} className="text-gray-500" />,
    'Diapers and Sanitary': <Baby size={24} className="text-pink-500" />,
    'Gloves': <Hand size={24} className="text-yellow-600" />,
    'Hospital Equipments': <Monitor size={24} className="text-indigo-600" />,
    'Hospital Furniture': <Sofa size={24} className="text-amber-600" />,
    'Hospital Instruments': <Wrench size={24} className="text-orange-600" />,
    'Hospital Linen': <Shirt size={24} className="text-cyan-600" />,
    'Infection Control': <Shield size={24} className="text-green-600" />,
    'Others': <MoreHorizontal size={24} className="text-slate-600" />,
    'PPE': <AlertCircle size={24} className="text-rose-600" />,
    'Spirits, Detergents and Disinfectants': <Droplet size={24} className="text-teal-600" />,
    'Syringes and Needles': <Syringe size={24} className="text-lime-600" />,
  };

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '#about' },
    {
      label: 'Our Products',
      href: '#',
      submenu: [
        'Bandages, Tapes and Dressings',
        'Bottles and Containers',
        'Catheters and Tubes',
        'Cotton Wool',
        'Diapers and Sanitary',
        'Gloves',
        'Hospital Equipments',
        'Hospital Furniture',
        'Hospital Instruments',
        'Hospital Linen',
        'Infection Control',
        'Others',
        'PPE',
        'Spirits, Detergents and Disinfectants',
        'Syringes and Needles',
      ],
    },
    { label: 'Talk to us', href: '#talk-to-us' },
  ];

  const partners = [
    { name: 'International Rescue Committee', icon: '🌍', type: 'NGO' },
    { name: 'Bomu Hospital', icon: '🏥', type: 'Hospital' },
    { name: 'FAO', icon: '🌱', type: 'Government' },
    { name: 'Gertrudes Childrens Hospital', icon: '👶', type: 'Hospital' },
    { name: 'JHPIEGO', icon: '💊', type: 'NGO' },
    { name: 'KEMSA', icon: '📦', type: 'Government' },
    { name: 'Kenya Ports Authority', icon: '🚢', type: 'Government' },
    { name: 'Kenya Red Cross Society', icon: '❤️', type: 'NGO' },
    { name: 'MEDS', icon: '🏢', type: 'Organization' },
    { name: 'Metro', icon: '🏪', type: 'Organization' },
    { name: 'Stiegelmeyer Group', icon: '🛏️', type: 'Corporate' },
    { name: 'PSI', icon: '���️', type: 'NGO' },
    { name: 'UNHCR', icon: '🤝', type: 'NGO' },
  ];

  const productCategories = [
    'Bandages, Tapes and Dressings',
    'Bottles and Containers',
    'Catheters and Tubes',
    'Cotton Wool',
    'Diapers and Sanitary',
    'Gloves',
    'Hospital Equipments',
    'Hospital Furniture',
    'Hospital Instruments',
    'Hospital Linen',
    'Infection Control',
    'Others',
    'PPE',
    'Spirits, Detergents and Disinfectants',
    'Syringes and Needles',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-50 border-b border-transparent bg-gradient-to-r from-white via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <BiolegendLogo size="md" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 ml-auto">
              {navigationItems.map((item) => {
              if (item.label === 'Talk to us') {
                return (
                  <Link
                    key={item.label}
                    to="/contact"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                );
              }
              if (item.label === 'About Us') {
                return (
                  <Link
                    key={item.label}
                    to="/about-us"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    {item.label}
                    {item.submenu && <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />}
                  </a>
                  {item.submenu && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-100 before:absolute before:bottom-full before:right-8 before:w-6 before:h-4 before:bg-white before:border-t-2 before:border-l-2 before:border-gray-100 before:rotate-45" style={{ minWidth: '750px' }}>
                      <div className="grid grid-cols-5 gap-x-8 gap-y-4 p-6">
                        {item.submenu.map((sub) => {
                          const product = getProductBySlug(sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                          const productSlug = product?.slug || sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                          return (
                            <Link
                              key={sub}
                              to={`/products/${productSlug}`}
                              className="flex flex-col items-center text-center group/item transition-all duration-200 hover:scale-110"
                            >
                              <div className="mb-2 transition-transform group-hover/item:scale-125">
                                {productIconMap[sub]}
                              </div>
                              <span className="text-xs text-gray-700 group-hover/item:text-primary group-hover/item:font-semibold transition-colors leading-tight">
                                {sub}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden ml-auto"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      item.submenu && setProductsDropdownOpen(!productsDropdownOpen)
                    }
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-primary/10 rounded flex justify-between items-center font-medium"
                  >
                    {item.label}
                    {item.submenu && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>
                  {item.submenu && productsDropdownOpen && (
                    <div className="bg-gray-50 pl-4">
              {item.submenu.map((sub) => {
                const product = getProductBySlug(sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                const productSlug = product?.slug || sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                return (
                  <Link
                    key={sub}
                    to={`/products/${productSlug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                  >
                    {sub}
                  </Link>
                );
              })}
            </div>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Products Section */}
      <ProductsSection />

      {/* Our Goals Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">Our Goals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Committed to delivering excellence in healthcare solutions across Africa
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Quality Products</h3>
                <p className="text-gray-600 leading-relaxed">
                  Supply only the highest quality hospital consumables and equipment to ensure patient safety and care excellence.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Affordable Pricing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Make quality healthcare products accessible to all healthcare institutions across Africa.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Reliable and timely delivery of critical care supplies to healthcare facilities across the continent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">Our Partners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by leading healthcare institutions across Africa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="group relative bg-white rounded-2xl p-6 flex flex-col items-center justify-center h-40 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2 hover:border-blue-400 cursor-pointer"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-green-500/0 group-hover:from-blue-500/10 group-hover:to-green-500/10 transition-all duration-300"></div>

                {/* Gradient border accent */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  {/* Icon */}
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {partner.icon}
                  </div>

                  {/* Partner Name */}
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-2">
                    {partner.name}
                  </p>

                  {/* Partner Type Badge */}
                  <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-gray-700 group-hover:from-blue-200 group-hover:to-green-200 transition-colors duration-300">
                    {partner.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talk to Us Section */}
      <section id="talk-to-us" className="bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Talk to us</h2>
          <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Interested in our products? Let's connect and discuss how we can support your healthcare needs across Africa.
          </p>
          <Link to="/app">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-10 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Access Our Application
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-blue-500 to-green-500"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Products</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                {productCategories.slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">More Products</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                {productCategories.slice(5, 10).map((cat) => (
                  <li key={cat}>
                    <a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Additional</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                {productCategories.slice(10).map((cat) => (
                  <li key={cat}>
                    <a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Application</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>
                  <Link to="/app" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Login to App
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    News
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Medplus Africa. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
