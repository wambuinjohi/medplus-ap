import { MessageCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export default function ProductsSection() {
  const products: Product[] = [
    {
      id: '1',
      name: 'Bandages, Tapes and Dressings',
      slug: 'bandages-tapes-and-dressings',
      description: 'High-quality bandages, tapes, and medical dressings for wound care and protection.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=400&fit=crop'
    },
    {
      id: '2',
      name: 'Bottles and Containers',
      slug: 'bottles-and-containers',
      description: 'Medical-grade bottles and containers for safe storage and transportation.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=500&h=400&fit=crop'
    },
    {
      id: '3',
      name: 'Catheters and Tubes',
      slug: 'catheters-and-tubes',
      description: 'Premium catheters and medical tubing for various clinical procedures.',
      image: 'https://images.unsplash.com/photo-1579154204601-01d82b06ae57?w=500&h=400&fit=crop'
    },
    {
      id: '4',
      name: 'Cotton Wool',
      slug: 'cotton-wool',
      description: 'Pure cotton wool products for medical and healthcare applications.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=500&h=400&fit=crop'
    },
    {
      id: '5',
      name: 'Diapers and Sanitary',
      slug: 'diapers-and-sanitary',
      description: 'Medical-grade incontinence and sanitary supplies for healthcare facilities.',
      image: 'https://images.unsplash.com/photo-1631217314830-68f7d8fb3d7c?w=500&h=400&fit=crop'
    },
    {
      id: '6',
      name: 'Gloves',
      slug: 'gloves',
      description: 'Protective medical gloves in latex, nitrile, and vinyl options.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=500&h=400&fit=crop'
    },
    {
      id: '7',
      name: 'Hospital Equipments',
      slug: 'hospital-equipments',
      description: 'Essential hospital equipment including monitors and critical care devices.',
      image: 'https://images.unsplash.com/photo-1576091160668-112b348f1a20?w=500&h=400&fit=crop'
    },
    {
      id: '8',
      name: 'Hospital Furniture',
      slug: 'hospital-furniture',
      description: 'Professional hospital beds, patient chairs, and examination tables.',
      image: 'https://images.unsplash.com/photo-1631217314830-68f7d8fb3d7c?w=500&h=400&fit=crop'
    },
    {
      id: '9',
      name: 'Hospital Instruments',
      slug: 'hospital-instruments',
      description: 'Surgical and diagnostic instruments including precision medical tools.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=400&fit=crop'
    },
    {
      id: '10',
      name: 'Hospital Linen',
      slug: 'hospital-linen',
      description: 'Medical-grade linens including sheets, pillowcases, and gowns.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=500&h=400&fit=crop'
    },
    {
      id: '11',
      name: 'Infection Control',
      slug: 'infection-control',
      description: 'Comprehensive infection prevention products and sterilization equipment.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=500&h=400&fit=crop'
    },
    {
      id: '12',
      name: 'PPE',
      slug: 'ppe',
      description: 'Personal Protective Equipment including gowns, masks, and face shields.',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?w=500&h=400&fit=crop'
    },
    {
      id: '13',
      name: 'Spirits, Detergents and Disinfectants',
      slug: 'spirits-detergents-and-disinfectants',
      description: 'Pharmaceutical-grade disinfectants and sterilization solutions.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=500&h=400&fit=crop'
    },
    {
      id: '14',
      name: 'Syringes and Needles',
      slug: 'syringes-and-needles',
      description: 'Sterile syringes and needles in various gauges and sizes.',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?w=500&h=400&fit=crop'
    },
    {
      id: '15',
      name: 'Others',
      slug: 'others',
      description: 'Additional medical supplies and healthcare products.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=400&fit=crop'
    }
  ];

  const generateWhatsAppLink = (product: Product) => {
    const message = `Hi, I'm interested in requesting a quote for: ${product.name}. Could you please provide pricing and availability details?`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white via-blue-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            Our Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive range of medical supplies and healthcare products for hospitals, clinics, and healthcare facilities
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1 hover:border-blue-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-green-500/0 group-hover:from-blue-500/5 group-hover:to-green-500/5 transition-all duration-300 pointer-events-none"></div>

              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6 relative z-10">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {product.description}
                </p>

                {/* Request Quote Button */}
                <a
                  href={generateWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle size={18} />
                  Request Quote
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
