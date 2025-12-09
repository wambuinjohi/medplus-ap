import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  image: string;
  title: string;
}

const productImages: Product[] = [
  {
    id: 1,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F669220bb3e3f463badf337779db69a22?format=webp&width=800',
    title: 'Wheelchair'
  },
  {
    id: 2,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2Fe543adf974cb47ee8e301a7539553127?format=webp&width=800',
    title: 'Medical Equipment'
  },
  {
    id: 3,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F56d6c436e4ff4a8bbd38747fc6e521ed?format=webp&width=800',
    title: 'IV Infusion Pump'
  },
  {
    id: 4,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2Fae1869cf776542cda062eb1c000b9973?format=webp&width=800',
    title: 'Hospital Cart'
  },
  {
    id: 5,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2Fd2d1d14956a4426d8ae3c036e52590e5?format=webp&width=800',
    title: 'Medical Bed'
  },
  {
    id: 6,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F15103fd8c7904e678f94e82074f63460?format=webp&width=800',
    title: 'First Aid Kit'
  },
  {
    id: 7,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2Fbd9d5ebd3478499aada67f58dec97997?format=webp&width=800',
    title: 'Stretcher'
  },
  {
    id: 8,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F03d3076c1d6f4294a0df1687c72756ac?format=webp&width=800',
    title: 'Blood Pressure Monitor'
  },
  {
    id: 9,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F1e4254007ebb40a089b0ace7d287cce7?format=webp&width=800',
    title: 'Medical Containers'
  },
  {
    id: 10,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F598859da3b90416b8ee7d7eb0c48007b?format=webp&width=800',
    title: 'Waste Bins'
  },
  {
    id: 11,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F217811c3c87f469a9a369c2b5c07ba7d?format=webp&width=800',
    title: 'Examination Gloves'
  },
  {
    id: 12,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F6551b332975d4151b859c05215607e54?format=webp&width=800',
    title: 'Medical Gloves'
  },
  {
    id: 13,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F25f50621019f4f8ea9df8d858cc400e2?format=webp&width=800',
    title: 'PPE Supplies'
  },
  {
    id: 14,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2Fed292dab3334400f9a58a512d651419f?format=webp&width=800',
    title: 'Anti-decubitus System'
  },
  {
    id: 15,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2Ff1fcf8875712492089544d620658af0d?format=webp&width=800',
    title: 'Syringes'
  },
  {
    id: 16,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F584d571f34d442f48990ddc667ab9147?format=webp&width=800',
    title: 'Medical Caps'
  },
  {
    id: 17,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F275bee1e79a1465c9f09416f5598f33d?format=webp&width=800',
    title: 'Latex Gloves'
  },
  {
    id: 18,
    image: 'https://cdn.builder.io/api/v1/image/assets%2F1dd87a2a31eb4fbba71f747479e1fade%2F97e7997c54fe4bb8b40e28f8321724c7?format=webp&width=800',
    title: 'Medical Supplies'
  }
];

export default function ProductCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = direction === 'left'
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;

      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3 sm:mb-4">Our Products</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Discover our comprehensive range of medical supplies and hospital equipment
          </p>
        </div>

        <div className="relative group">
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 scroll-smooth snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            {productImages.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-80 sm:w-96 snap-center"
              >
                <div className="group/card relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-80 sm:h-96">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <h3 className="text-white font-bold text-lg">{product.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 sm:-translate-x-8 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="text-blue-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:translate-x-8 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="text-blue-600" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <p className="text-center text-gray-500 text-sm mt-6 opacity-75">
          Drag to scroll or use the arrows above
        </p>
      </div>
    </section>
  );
}
