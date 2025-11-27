import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/7722677/pexels-photo-7722677.jpeg?w=1200&h=800&fit=crop',
      alt: 'Medical supplies including gauze, scissors, and alcohol prep pads'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/20041997/pexels-photo-20041997.jpeg?w=1200&h=800&fit=crop',
      alt: 'Modern hospital examination room with medical equipment'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/6129902/pexels-photo-6129902.jpeg?w=1200&h=800&fit=crop',
      alt: 'Healthcare supplies cotton balls for medical applications'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen bg-white overflow-hidden">
      {/* Slider Background */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-transform duration-1200 ease-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translateX(${(index - currentSlide) * 100}%)`
            }}
          >
            {/* Gradient overlay - blue to green */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-500 opacity-40"></div>
          </div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center h-full">
            
            {/* Left: Information Section (Floating, Transparent) */}
            <div className="space-y-8 py-20 md:py-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20">
                <div className="space-y-6">
                  <div>
                    <span className="inline-block bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      OVER 10 YEARS
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                      OF TRUSTED SERVICE
                    </h1>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed">
                      World Class Critical Care, Hospital Consumables and Furniture Distributors.
                    </p>
                    <p className="text-lg text-white/90 leading-relaxed">
                      Bettering lives together.
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link to="/about-us">
                      <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                        Learn More
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex items-center gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50 w-2 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Image Section */}
            <div className="hidden md:flex justify-center items-center h-full">
              <div className="relative w-full max-w-md h-96 overflow-hidden rounded-2xl">
                {/* Main Image */}
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="absolute inset-0 transition-transform duration-1200 ease-out rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      transform: `translateX(${(index - currentSlide) * 100}%)`
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ))}

                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    onClick={prevSlide}
                    className="bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
        <p className="text-white text-sm font-semibold">
          {currentSlide + 1} / {slides.length}
        </p>
      </div>
    </section>
  );
}
