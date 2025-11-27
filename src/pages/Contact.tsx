import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { useToast } from '@/hooks/use-toast';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useSEO } from '@/hooks/useSEO';
import { generateContactPageSchema } from '@/utils/seoHelpers';
import emailjs from 'emailjs-com';
import { Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  useSEO(
    {
      title: 'Contact Us',
      description: 'Get in touch with Medplus Africa for inquiries and support. We provide quality medical supplies and hospital equipment to healthcare facilities across Africa. Call +254 741 207 690 or email us directly.',
      keywords: 'contact medplus, medical supplies contact, customer support, healthcare inquiries, hospital equipment support',
      url: 'https://medplusafrica.com/contact',
      type: 'website',
    },
    generateContactPageSchema()
  );

  // Initialize EmailJS
  emailjs.init('dK906nDGwBHoPvOsr');

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    if (contactMethod === 'email') {
      handleEmailSubmit();
    } else {
      handleWhatsAppSubmit();
    }
  };

  const handleEmailSubmit = async () => {
    try {
      const templateParams = {
        to_email: 'sales@medplusafrica.com',
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject,
        message: formData.message,
      };

      await emailjs.send('service_v8xry1b', 'template_ulgafes', templateParams);

      toast({
        title: "Success!",
        description: "Your inquiry has been sent via email. We'll get back to you shortly.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = () => {
    try {
      const message = `*Inquiry from Medplus Africa Contact Form*
━━━━━━━━━━━━━━━━━━━━━━

*From:*
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
${formData.company ? `Company: ${formData.company}` : ''}

*Subject:*
${formData.subject}

*Message:*
${formData.message}

━━━━━━━━━━━━━━━━━━━━━━`;

      const whatsappPhone = '+254734785363';
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');

      toast({
        title: "Success!",
        description: "Opening WhatsApp. Please review and send your message.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader currentPage="contact" />

      {/* Breadcrumb */}
      <BreadcrumbNav items={[{ label: 'Contact Us', href: '/contact' }]} />

      {/* Page Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/90">Get in touch with our team for inquiries and support</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {/* Contact Method Toggle */}
              <fieldset className="mb-6">
                <legend className="sr-only">Choose contact method</legend>
                <div className="flex gap-3">
                  <button
                    onClick={() => setContactMethod('email')}
                    role="option"
                    aria-selected={contactMethod === 'email'}
                    aria-label="Send message via email"
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      contactMethod === 'email'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mail size={18} />
                    Email
                  </button>
                  <button
                    onClick={() => setContactMethod('whatsapp')}
                    role="option"
                    aria-selected={contactMethod === 'whatsapp'}
                    aria-label="Send message via WhatsApp"
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      contactMethod === 'whatsapp'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                </div>
              </fieldset>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 mb-2">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 mb-2">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 mb-2">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-gray-700 mb-2">Company/Institution</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Your organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-700 mb-2">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-700 mb-2">Message *</Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-white font-semibold flex items-center justify-center gap-2 ${
                    contactMethod === 'email'
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  size="lg"
                >
                  {contactMethod === 'email' ? (
                    <>
                      <Mail size={18} />
                      {isSubmitting ? 'Sending via Email...' : 'Send via Email'}
                    </>
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      {isSubmitting ? 'Opening WhatsApp...' : 'Send via WhatsApp'}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Info</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales & Inquiries</h3>
                  <p className="text-gray-600 mb-1">
                    <a href="mailto:sales@medplusafrica.com" className="text-primary hover:underline">
                      sales@medplusafrica.com
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <a href="tel:+254734785363" className="text-primary hover:underline">
                      +254 734 785 363
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">General Inquiries</h3>
                  <p className="text-gray-600 mb-1">
                    <a href="mailto:info@medplusafrica.com" className="text-primary hover:underline">
                      info@medplusafrica.com
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <a href="tel:+254721504000" className="text-primary hover:underline">
                      +254 721 504 000
                    </a>
                  </p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Time</h3>
                  <p className="text-gray-700">
                    We typically respond to inquiries within 24 business hours. For urgent matters, please call us directly.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Hours</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Monday - Friday: 8:00 AM - 5:00 PM</li>
                    <li>Saturday: 9:00 AM - 1:00 PM</li>
                    <li>Sunday & Public Holidays: Closed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Our Catalog?</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Download our complete product catalog or browse our offerings
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              View Our Products
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
              © 2025 Medplus Africa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
