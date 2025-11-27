import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import HeroSlider from '@/components/HeroSlider';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

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
    'International Rescue Committee',
    'Bomu Hospital',
    'FAO',
    'Gertrudes Childrens Hospital',
    'JHPIEGO',
    'KEMSA',
    'Kenya Ports Authority',
    'Kenya Red Cross Society',
    'MEDS',
    'Metro',
    'Stiegelmeyer Group',
    'PSI',
    'UNHCR',
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
      <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <BiolegendLogo size="md" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
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
                    {item.submenu && <ChevronDown size={16} />}
                  </a>
                  {item.submenu && (
                    <div className="absolute left-0 mt-0 w-64 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-10 border border-gray-100">
                      {item.submenu.map((sub) => (
                        <a
                          key={sub}
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {sub}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
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
                      {item.submenu.map((sub) => (
                        <a
                          key={sub}
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                        >
                          {sub}
                        </a>
                      ))}
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

      {/* Our Goals Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Goals</h2>
            <p className="text-lg text-gray-600">
              Committed to delivering excellence in healthcare solutions across Africa
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-600">
                Supply only the highest quality hospital consumables and equipment to ensure patient safety and care excellence.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">
                Make quality healthcare products accessible to all healthcare institutions across Africa.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Reliable and timely delivery of critical care supplies to healthcare facilities across the continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Partners</h2>
            <p className="text-lg text-gray-600">
              Trusted by leading healthcare institutions across Africa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {partners.map((partner) => (
              <div
                key={partner}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 flex items-center justify-center h-32 hover:shadow-md transition hover:from-gray-100 hover:to-gray-200 border border-gray-200"
              >
                <p className="text-center text-sm text-gray-700 font-medium leading-tight">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talk to Us Section */}
      <section id="talk-to-us" className="bg-gradient-to-r from-primary/90 to-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Talk to us</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Interested in our products? Let's connect and discuss how we can support your healthcare needs.
          </p>
          <Link to="/app">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold"
            >
              Access Our Application
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Products</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                {productCategories.slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <a href="#" className="hover:text-white transition">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">More Products</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                {productCategories.slice(5, 10).map((cat) => (
                  <li key={cat}>
                    <a href="#" className="hover:text-white transition">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Additional</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                {productCategories.slice(10).map((cat) => (
                  <li key={cat}>
                    <a href="#" className="hover:text-white transition">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Application</h3>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>
                  <Link to="/app" className="hover:text-white transition">
                    Login to App
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    News
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Alpha Medical Manufacturers Limited. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
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
