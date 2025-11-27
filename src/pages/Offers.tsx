import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';

export default function Offers() {
  const activeOffers = [
    {
      id: 1,
      title: 'Hospital Equipment Clearance Sale',
      discount: '25% OFF',
      description: 'Limited time offer on selected hospital equipment. Perfect for facility upgrades.',
      validUntil: 'January 31, 2025',
      category: 'Equipment',
      featured: true
    },
    {
      id: 2,
      title: 'Medical Supplies Bundle Package',
      discount: '20% OFF',
      description: 'Buy our curated bundle of essential medical supplies and save big.',
      validUntil: 'February 15, 2025',
      category: 'Supplies',
      featured: true
    },
    {
      id: 3,
      title: 'Infection Control Products Special',
      discount: '15% OFF',
      description: 'Enhanced protection with our infection control range at special pricing.',
      validUntil: 'February 28, 2025',
      category: 'Safety',
      featured: false
    },
    {
      id: 4,
      title: 'Hospital Furniture Mega Sale',
      discount: '30% OFF',
      description: 'Transform your facility with quality furniture at unbeatable prices.',
      validUntil: 'January 31, 2025',
      category: 'Furniture',
      featured: true
    },
    {
      id: 5,
      title: 'Bulk Order Discount Program',
      discount: 'UP TO 35% OFF',
      description: 'Special pricing for bulk orders. Perfect for large healthcare facilities.',
      validUntil: 'Ongoing',
      category: 'Program',
      featured: false
    },
    {
      id: 6,
      title: 'New Year Clearance on Old Stock',
      discount: '40% OFF',
      description: 'Make room for new inventory. Selected items heavily discounted.',
      validUntil: 'January 20, 2025',
      category: 'Clearance',
      featured: false
    },
  ];

  const featuredOffers = activeOffers.filter(offer => offer.featured);

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
              <a href="/" className="text-gray-700 hover:text-primary transition-colors font-medium">Home</a>
              <a href="/about-us" className="text-gray-700 hover:text-primary transition-colors font-medium">About Us</a>
              <a href="/products" className="text-gray-700 hover:text-primary transition-colors font-medium">Our Products</a>
              <a href="/offers" className="text-primary font-medium">Offers</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Special Offers</span>
          </nav>
        </div>
      </div>

      {/* Page Hero */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Special Offers & Promotions</h1>
          <p className="text-xl text-white/90">Exclusive deals on quality medical products and equipment</p>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Offers</h2>
          <p className="text-gray-600 mb-12">Limited time promotions - don't miss out!</p>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredOffers.map((offer) => (
              <div
                key={offer.id}
                className="relative bg-white border-2 border-primary rounded-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
              >
                {/* Ribbon */}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                  {offer.discount}
                </div>

                <div className="p-8">
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {offer.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-3">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{offer.description}</p>
                  <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <span>⏱️</span>
                    Valid until: {offer.validUntil}
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                    Claim Offer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Offers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">All Active Offers</h2>
          <div className="space-y-4">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {offer.category}
                    </span>
                    <span className="text-sm font-bold text-red-600">{offer.discount}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{offer.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>⏱️</span>
                    Valid until: {offer.validUntil}
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold whitespace-nowrap">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Our Offers Are The Best</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Guaranteed Quality</h3>
              <p className="text-gray-600 text-sm">All discounted products maintain our quality standards</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                  🚚
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-gray-600 text-sm">On selected offers for orders above minimum value</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                  💳
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Flexible Payment</h3>
              <p className="text-gray-600 text-sm">Multiple payment options and credit terms available</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Money Back Guarantee</h3>
              <p className="text-gray-600 text-sm">Unsatisfied? Return within 30 days for a full refund</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Save?</h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us now to discuss our custom offers for your facility
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-8">
            <div className="flex justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058z" />
                </svg>
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-6 text-center">
              © 2025 Alpha Medical Manufacturers Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
