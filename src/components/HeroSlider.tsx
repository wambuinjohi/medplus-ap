import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop',
      alt: 'Flat neutral healthcare background'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1576091160674-4f10897f0aeb?w=800&h=600&fit=crop',
      alt: 'Minimalist medical illustration'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFadeIn(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setFadeIn(true);
    }, 500);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen bg-white overflow-hidden">
      {/* Slider Background */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Gradient overlay - blue to green */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-500 opacity-40"></div>
        </div>
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
                      EST. 1989
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                      SINCE 1989
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
                    <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                      Learn More
                    </button>
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
              <div className="relative w-full max-w-md h-96">
                {/* Main Image */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 rounded-2xl overflow-hidden shadow-2xl ${
                    fadeIn ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].alt}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

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
