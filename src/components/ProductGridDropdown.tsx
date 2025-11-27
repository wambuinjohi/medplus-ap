import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface Product {
  name: string;
  icon: string;
}

interface ProductCategory {
  name: string;
  icon: string;
  products: Product[];
}

const productCategories: ProductCategory[] = [
  {
    name: 'Bandages, Tapes and Dressings',
    icon: '🩹',
    products: [
      { name: 'Sterile Adhesive Bandages', icon: '🩹' },
      { name: 'Medical Tape', icon: '📋' },
      { name: 'Wound Dressings', icon: '🧴' },
      { name: 'Gauze Pads', icon: '🧻' },
    ]
  },
  {
    name: 'Bottles and Containers',
    icon: '🧴',
    products: [
      { name: 'Sample Collection Bottles', icon: '🧪' },
      { name: 'Pharmaceutical Containers', icon: '🧴' },
      { name: 'Specimen Jars', icon: '🫙' },
    ]
  },
  {
    name: 'Catheters and Tubes',
    icon: '🔬',
    products: [
      { name: 'Urinary Catheters', icon: '💉' },
      { name: 'Peritoneal Dialysis Catheters', icon: '🔬' },
      { name: 'Central Line Catheters', icon: '🧬' },
    ]
  },
  {
    name: 'Cotton Wool',
    icon: '☁️',
    products: [
      { name: 'Sterilized Cotton Wool Balls', icon: '☁️' },
      { name: 'Medical Grade Cotton Wool', icon: '🧻' },
      { name: 'Cotton Wool Rolls', icon: '📦' },
    ]
  },
  {
    name: 'Diapers and Sanitary',
    icon: '👶',
    products: [
      { name: 'Incontinence Diapers', icon: '👶' },
      { name: 'Sanitary Pads', icon: '🩸' },
      { name: 'Briefs and Underwear', icon: '👕' },
    ]
  },
  {
    name: 'Gloves',
    icon: '🧤',
    products: [
      { name: 'Latex Examination Gloves', icon: '🧤' },
      { name: 'Nitrile Gloves', icon: '🧤' },
      { name: 'Vinyl Gloves', icon: '🧤' },
    ]
  },
  {
    name: 'Hospital Equipments',
    icon: '🏥',
    products: [
      { name: 'Patient Monitors', icon: '📊' },
      { name: 'Hospital Carts', icon: '🛒' },
      { name: 'Infusion Pumps', icon: '💧' },
    ]
  },
  {
    name: 'Hospital Furniture',
    icon: '🛏️',
    products: [
      { name: 'Hospital Beds', icon: '🛏️' },
      { name: 'Patient Chairs', icon: '🪑' },
      { name: 'Examination Tables', icon: '📋' },
    ]
  },
  {
    name: 'Hospital Instruments',
    icon: '⚕️',
    products: [
      { name: 'Surgical Scissors', icon: '✂️' },
      { name: 'Specula', icon: '⚕️' },
      { name: 'Forceps', icon: '🔧' },
    ]
  },
  {
    name: 'Hospital Linen',
    icon: '🧻',
    products: [
      { name: 'Hospital Bed Sheets', icon: '🧻' },
      { name: 'Pillowcases', icon: '🛏️' },
      { name: 'Surgical Gowns', icon: '👔' },
    ]
  },
  {
    name: 'Infection Control',
    icon: '🛡️',
    products: [
      { name: 'Disinfectants', icon: '🧼' },
      { name: 'Sterilization Equipment', icon: '🔬' },
      { name: 'Protective Barriers', icon: '🛡️' },
    ]
  },
  {
    name: 'PPE',
    icon: '👕',
    products: [
      { name: 'Face Masks', icon: '😷' },
      { name: 'Protective Gowns', icon: '👕' },
      { name: 'Face Shields', icon: '🥽' },
    ]
  },
  {
    name: 'Spirits, Detergents and Disinfectants',
    icon: '🧼',
    products: [
      { name: 'Hand Sanitizer', icon: '🧴' },
      { name: 'Surface Disinfectant', icon: '🧼' },
      { name: 'Surgical Spirit', icon: '🧪' },
    ]
  },
  {
    name: 'Syringes and Needles',
    icon: '💉',
    products: [
      { name: 'Sterile Syringes', icon: '💉' },
      { name: 'Hypodermic Needles', icon: '💉' },
      { name: 'Syringe Filters', icon: '🔬' },
    ]
  },
  {
    name: 'Others',
    icon: '📦',
    products: [
      { name: 'Medical Supplies', icon: '📦' },
      { name: 'Healthcare Products', icon: '🏥' },
      { name: 'Misc Items', icon: '📦' },
    ]
  },
];

export default function ProductGridDropdown() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  return (
    <>
      {/* Grid Dropdown */}
      <div className="absolute left-0 mt-2 w-[900px] bg-white shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-8 px-8 z-50 border border-gray-100">
        <div className="grid grid-cols-5 gap-6">
          {productCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category)}
              className="group/item flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="text-5xl mb-3 group-hover/item:scale-125 transition-transform duration-300">
                {category.icon}
              </div>
              <p className="text-center text-xs font-semibold text-gray-700 leading-tight line-clamp-2 group-hover/item:text-blue-600 transition-colors">
                {category.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Side Drawer */}
      {selectedCategory && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setSelectedCategory(null)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-4xl mb-2">{selectedCategory.icon}</div>
                <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Products List */}
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Available Products</h3>
              {selectedCategory.products.map((product) => (
                <div
                  key={product.name}
                  className="group/product flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-3xl flex-shrink-0">{product.icon}</div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900 group-hover/product:text-blue-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">In stock • Quick delivery</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover/product:text-blue-600 transition-colors flex-shrink-0" />
                </div>
              ))}

              {/* CTA Button */}
              <div className="pt-6 border-t border-gray-200">
                <a
                  href={`https://wa.me/?text=Hi, I'm interested in ${selectedCategory.name} products. Could you provide more details?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 text-center"
                >
                  Request Quote
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
