import { Link, useSearchParams } from 'react-router-dom';
import React, { useEffect, useMemo } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import ProductCategorySidebar from '@/components/ProductCategorySidebar';
import { useWebCategories } from '@/hooks/useWebCategories';
import { useSEO } from '@/hooks/useSEO';
import { generateWebPageSchema, useBreadcrumbSchema, generateCollectionSchema, addStructuredData } from '@/utils/seoHelpers';

export default function OurProducts() {
  const { categories } = useWebCategories();
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(q) ||
      (cat.description || '').toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q)
    );
  }, [categories, q]);

  useSEO(
    {
      title: 'Our Products',
      description: 'Browse our comprehensive range of medical supplies and hospital equipment. From bandages and dressings to hospital furniture and instruments.',
      keywords: 'medical products, hospital supplies, healthcare equipment, medical equipment',
      url: 'https://medplusafrica.com/products',
    },
    generateWebPageSchema({
      title: 'Our Products - Medical Supplies & Equipment',
      description: 'Comprehensive range of hospital consumables, medical equipment, and furniture',
      url: 'https://medplusafrica.com/products',
    })
  );

  useBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Our Products', url: '/products' }
  ]);

  // Add collection schema with available categories
  useEffect(() => {
    if (categories.length > 0) {
      const collectionSchema = generateCollectionSchema(
        categories.map((cat) => ({
          name: cat.name,
          description: cat.description || `${cat.name} collection`,
          image: undefined,
          url: `https://medplusafrica.com/products/${cat.slug}`,
        }))
      );
      addStructuredData(collectionSchema);
    }
  }, [categories]);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader currentPage="products" />

      {/* Breadcrumb */}
      <BreadcrumbNav items={[{ label: 'Our Products', href: '/products' }]} />

      {/* Page Hero removed per request */}

      {/* Introduction — Info Area (one column row) */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-green-50 shadow-sm">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-600 to-green-500" />
            <div className="flex gap-4 sm:gap-5 p-5 sm:p-6 lg:p-7">
              <div className="hidden sm:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">About Our Products</h2>
                <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                  Medplus Africa offers a comprehensive range of hospital consumables, medical equipment, and furniture to meet all your healthcare facility needs. Our products are sourced from trusted manufacturers and meet international quality standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section with Sidebar */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flex Container for Sidebar and Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <ProductCategorySidebar />

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Product Categories</h2>
                {q && <span className="text-sm text-gray-500">Search: "{q}" — {filteredCategories.length} result(s)</span>}
              </div>
              {q && filteredCategories.length === 0 && categories.length > 0 && (
                <div className="text-center py-8 bg-white rounded-lg border mb-6">
                  <p className="text-gray-600">No categories match "{q}"</p>
                  <Link to="/products" className="text-primary text-sm hover:underline">Clear search</Link>
                </div>
              )}
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading categories...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products/${category.slug}`}
                      onClick={() => console.log('[OurProducts] Learn more click', category.slug)}
                      className="block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition p-6 group cursor-pointer"
                    >
                      <div className="text-4xl mb-4">{category.icon || '📦'}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {category.description || `Browse our ${category.name.toLowerCase()} collection`}
                      </p>
                      <span className="text-primary font-medium group-hover:text-primary/80 transition flex items-center gap-1">
                        Learn more → <span className="text-xs">({category.variant_count || 0} items)</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Our Products?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">All products meet international quality and safety standards</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick and reliable delivery across Africa</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">Best prices without compromising on quality</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5-5l-3 3" />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm">Dedicated team ready to assist your needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need More Information?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us to place an order or request a detailed product catalog
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter productCategories={categories} />
    </div>
  );
}
