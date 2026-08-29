import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Bandage, Package, Pipette, Wind, Baby, Hand, Monitor, Sofa, Wrench, Shirt, Shield, MoreHorizontal, Droplet, Syringe, AlertCircle } from 'lucide-react';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import { useWebCategories } from '@/hooks/useWebCategories';
import { searchVariants, WebVariantForPublic } from '@/services/webManagerService';
import { getProductBySlug } from '@/data/products';

interface PublicHeaderProps {
  currentPage?: string;
}

export function PublicHeader({ currentPage }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WebVariantForPublic[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { categories: dynamicCategories } = useWebCategories();

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

  // Build submenu from dynamic categories, fallback to static list if none loaded yet
  const staticSubmenu = [
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

  const submenuItems = dynamicCategories.length > 0
    ? dynamicCategories.map(c => ({ name: c.name, slug: c.slug }))
    : staticSubmenu.map(name => ({
        name,
        slug: getProductBySlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }));

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Offers', href: '/offers' },
    { label: 'About Us', href: '#about' },
    {
      label: 'Our Products',
      href: '#',
      submenu: submenuItems,
    },
    { label: 'Talk to us', href: '#talk-to-us' },
  ];

  const isCurrentPage = (page: string) => currentPage === page;

  // Debounced search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const results = await searchVariants(searchTerm, 8);
      setSearchResults(results);
      setShowResults(true);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (variant: WebVariantForPublic) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/products/${variant.slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0]);
    } else if (searchTerm.trim().length >= 2) {
      // fallback: navigate to products with query param to filter
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <header className="sticky top-0 bg-white shadow-md z-50 border-b border-transparent bg-gradient-to-r from-white via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <BiolegendLogo size="md" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 ml-auto">
            {navigationItems.map((item) => {
              if (item.label === 'Talk to us') {
                return (
                  <Link
                    key={item.label}
                    to="/contact"
                    className={`transition-colors font-medium ${
                      isCurrentPage('contact')
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              if (item.label === 'Offers') {
                return (
                  <Link
                    key={item.label}
                    to="/offers"
                    className={`transition-colors font-medium ${
                      isCurrentPage('offers')
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
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
                    className={`transition-colors font-medium ${
                      isCurrentPage('about')
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              if (item.label === 'Home') {
                return (
                  <Link
                    key={item.label}
                    to="/"
                    className={`transition-colors font-medium ${
                      isCurrentPage('home')
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className={`transition-colors flex items-center gap-1 font-medium ${
                      isCurrentPage('products')
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.label}
                    {item.submenu && <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />}
                  </a>
                  {item.submenu && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-100 before:absolute before:bottom-full before:right-8 before:w-6 before:h-4 before:bg-white before:border-t-2 before:border-l-2 before:border-gray-100 before:rotate-45" style={{ minWidth: '750px' }}>
                      <div className="grid grid-cols-5 gap-x-8 gap-y-4 p-6">
                        {item.submenu.map((sub: any) => {
                          const slug = sub.slug;
                          return (
                            <Link
                              key={sub.name}
                              to={`/products/${slug}`}
                              className="flex flex-col items-center text-center group/item transition-all duration-200 hover:scale-110"
                            >
                              <div className="mb-2 transition-transform group-hover/item:scale-125">
                                {productIconMap[sub.name] || <Package size={24} className="text-gray-400" />}
                              </div>
                              <span className="text-xs text-gray-700 group-hover/item:text-primary group-hover/item:font-semibold transition-colors leading-tight">
                                {sub.name}
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

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:block relative ml-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
            {showResults && (
              <div className="absolute top-full mt-2 w-80 bg-white border border-gray-100 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No products found for "{searchTerm}"</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleSelectResult(v)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                      >
                        {v.image_path ? (
                          <img src={v.image_path} alt={v.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{v.name}</div>
                          <div className="text-xs text-gray-500 truncate">SKU: {v.sku} • {v.slug}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
            {/* Mobile Search */}
            <div className="px-2 pb-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
              {searchTerm.length >= 2 && (
                <div className="mt-2 bg-white border border-gray-100 rounded-lg max-h-64 overflow-y-auto">
                  {searching ? (
                    <div className="p-3 text-center text-sm text-gray-500">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">No products found</div>
                  ) : (
                    searchResults.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => { handleSelectResult(v); setMobileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <span className="truncate">{v.name} — {v.sku}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {navigationItems.map((item) => (
              <div key={item.label}>
                {item.label === 'Talk to us' ? (
                  <Link
                    to="/contact"
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-primary/10 rounded font-medium"
                  >
                    {item.label}
                  </Link>
                ) : item.label === 'Offers' ? (
                  <Link
                    to="/offers"
                    className={`w-full text-left px-4 py-2 rounded font-medium ${
                      isCurrentPage('offers')
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-700 hover:bg-primary/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : item.label === 'About Us' ? (
                  <Link
                    to="/about-us"
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-primary/10 rounded font-medium"
                  >
                    {item.label}
                  </Link>
                ) : item.label === 'Home' ? (
                  <Link
                    to="/"
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-primary/10 rounded font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
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
                      <div className="bg-gray-50 space-y-1 px-4 py-2">
                        {(item.submenu as any[]).map((sub) => {
                          return (
                            <Link
                              key={sub.name}
                              to={`/products/${sub.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 rounded"
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
