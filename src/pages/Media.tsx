import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useSEO } from '@/hooks/useSEO';
import { generateWebPageSchema } from '@/utils/seoHelpers';

export default function Media() {
  useSEO(
    {
      title: 'Media Center',
      description: 'Latest news, CME sessions, and events from Medplus Africa. Stay updated on industry news and healthcare developments.',
      keywords: 'healthcare news, medical news, healthcare events, CME sessions',
      url: 'https://medplusafrica.com/media',
    },
    generateWebPageSchema({
      title: 'Media Center - News & Events',
      description: 'News, CME sessions, and events',
      url: 'https://medplusafrica.com/media',
    })
  );
  const newsItems = [
    {
      id: 1,
      date: 'January 15, 2025',
      title: 'Medplus Africa Expands Operations to East Africa',
      excerpt: 'We are excited to announce the opening of our new distribution center in Kampala, Uganda...',
      category: 'News'
    },
    {
      id: 2,
      date: 'January 8, 2025',
      title: 'New Partnership with International Healthcare Organization',
      excerpt: 'Medplus Africa has partnered with leading international healthcare organizations to improve access...,',
      category: 'News'
    },
    {
      id: 3,
      date: 'December 28, 2024',
      title: 'Year-End Special: Up to 20% Discount on Selected Products',
      excerpt: 'As a token of our appreciation, we are offering exclusive discounts on our entire range...',
      category: 'Offers'
    },
    {
      id: 4,
      date: 'December 15, 2024',
      title: 'Medplus Africa Achieves ISO 9001 Certification',
      excerpt: 'We are proud to announce that we have successfully obtained ISO 9001 certification...',
      category: 'News'
    },
  ];

  const cmeEvents = [
    {
      id: 1,
      date: 'February 20, 2025',
      title: 'CME: Best Practices in Hospital Infection Control',
      location: 'Nairobi, Kenya',
      description: 'Join us for an educational session on the latest infection control protocols and best practices.',
      type: 'CME'
    },
    {
      id: 2,
      date: 'March 5, 2025',
      title: 'Workshop: Optimizing Hospital Procurement',
      location: 'Virtual',
      description: 'Learn strategies to optimize procurement processes and reduce costs while maintaining quality.',
      type: 'Workshop'
    },
    {
      id: 3,
      date: 'March 20, 2025',
      title: 'Product Demo: New Hospital Equipment Solutions',
      location: 'Nairobi & Mombasa',
      description: 'Experience our latest hospital equipment and furniture solutions with live demonstrations.',
      type: 'Demo'
    },
  ];

  const events = [
    {
      id: 1,
      date: 'February 10, 2025',
      title: 'East Africa Healthcare Summit 2025',
      location: 'Nairobi Convention Center',
      description: 'Annual summit bringing together healthcare professionals to discuss industry trends.',
    },
    {
      id: 2,
      date: 'February 28, 2025',
      title: 'Medplus Africa Product Exhibition',
      location: 'Kenyatta International Convention Center',
      description: 'Showcase of our latest products and solutions in medical supplies and equipment.',
    },
    {
      id: 3,
      date: 'March 15, 2025',
      title: 'Healthcare Facility Management Training',
      location: 'Multiple Locations',
      description: 'Training program for healthcare facility managers on best practices and new products.',
    },
  ];

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
              <a href="/media" className="text-primary font-medium">Media</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <BreadcrumbNav items={[{ label: 'Media', href: '/media' }]} />

      {/* Page Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Media Center</h1>
          <p className="text-xl text-white/90">News, CME sessions, and events</p>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Latest News</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {newsItems.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <a href="#" className="text-primary font-medium hover:text-primary/80 transition">
                    Read more →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CME Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">CME & Training</h2>
          <div className="space-y-6">
            {cmeEvents.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {item.type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 {item.date}</span>
                      <span>�� {item.location}</span>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold whitespace-nowrap">
                    Register
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Upcoming Events</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 px-6 py-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-primary">📅 {item.date}</p>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm flex items-center gap-2">
                    <span>📍</span>
                    {item.location}
                  </p>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter to receive the latest news and updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <Button className="bg-white text-primary hover:bg-gray-100 font-semibold">
              Subscribe
            </Button>
          </div>
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
              © 2025 Medplus Africa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
