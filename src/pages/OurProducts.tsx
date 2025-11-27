import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import ProductCategorySidebar from '@/components/ProductCategorySidebar';
import { useSEO } from '@/hooks/useSEO';
import { generateWebPageSchema } from '@/utils/seoHelpers';
import { productCategoryNames } from '@/data/categories';

export default function OurProducts() {
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
  const productCategories = [
    { name: 'Bandages, Tapes and Dressings', icon: '🩹', description: 'Complete range of medical dressings and bandages for wound care', slug: 'bandages-tapes-and-dressings' },
    { name: 'Bottles and Containers', icon: '🧴', description: 'Sterile containers for specimen collection and storage', slug: 'bottles-and-containers' },
    { name: 'Catheters and Tubes', icon: '💉', description: 'Medical-grade catheters and tubing systems', slug: 'catheters-and-tubes' },
    { name: 'Cotton Wool', icon: '☁️', description: 'High-quality absorbent cotton products', slug: 'cotton-wool' },
    { name: 'Diapers and Sanitary', icon: '👶', description: 'Adult and pediatric incontinence products', slug: 'diapers-and-sanitary' },
    { name: 'Gloves', icon: '🧤', description: 'Medical examination and surgical gloves', slug: 'gloves' },
    { name: 'Hospital Equipments', icon: '🏥', description: 'Advanced medical equipment and monitors', slug: 'hospital-equipments' },
    { name: 'Hospital Furniture', icon: '🛏️', description: 'Hospital beds, trolleys, and medical furniture', slug: 'hospital-furniture' },
    { name: 'Hospital Instruments', icon: '⚕️', description: 'Surgical and diagnostic instruments', slug: 'hospital-instruments' },
    { name: 'Hospital Linen', icon: '🧺', description: 'Medical-grade sheets, pillows, and linens', slug: 'hospital-linen' },
    { name: 'Infection Control', icon: '🛡️', description: 'Disinfectants, sanitizers, and safety equipment', slug: 'infection-control' },
    { name: 'Others', icon: '📦', description: 'Additional medical supplies and accessories', slug: 'others' },
    { name: 'PPE', icon: '🦺', description: 'Personal protective equipment and safety gear', slug: 'ppe' },
    { name: 'Spirits, Detergents and Disinfectants', icon: '🧼', description: 'Cleaning and sterilization products', slug: 'spirits-detergents-and-disinfectants' },
    { name: 'Syringes and Needles', icon: '💊', description: 'Sterile syringes and hypodermic needles', slug: 'syringes-and-needles' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader currentPage="products" />

      {/* Breadcrumb */}
      <BreadcrumbNav items={[{ label: 'Our Products', href: '/products' }]} />

      {/* Page Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-xl text-white/90">Comprehensive range of medical supplies and hospital equipment</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-lg text-gray-700 leading-relaxed">
              Medplus Africa offers a comprehensive range of hospital consumables, medical equipment, and furniture to meet all your healthcare facility needs. Our products are sourced from trusted manufacturers and meet international quality standards.
            </p>
          </div>
        </div>
      </section>

      {/* Product Categories Section with Sidebar */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flex Container for Sidebar and Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <ProductCategorySidebar
              categories={productCategories.map((cat) => ({ name: cat.name }))}
            />

            {/* Main Content */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">Product Categories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productCategories.map((category) => (
                  <div
                    key={category.name}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition p-6"
                  >
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <Link to={`/products/${category.slug}`} className="text-primary font-medium hover:text-primary/80 transition">
                      Learn more →
                    </Link>
                  </div>
                ))}
              </div>
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

      <PublicFooter productCategories={productCategoryNames} />
    </div>
  );
}
