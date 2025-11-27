export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  longDescription: string;
  pricing: {
    basePrice: string;
    currency: string;
    unit: string;
    minOrder?: string;
  };
  specifications: {
    label: string;
    value: string;
  }[];
  features: string[];
}

export const products: Product[] = [
  {
    id: 'bandages-tapes-dressings',
    slug: 'bandages-tapes-and-dressings',
    name: 'Bandages, Tapes and Dressings',
    image: 'https://images.pexels.com/photos/5146554/pexels-photo-5146554.jpeg?w=500&h=400&fit=crop',
    description: 'Complete range of medical dressings and bandages for wound care',
    longDescription: 'Our comprehensive collection of bandages, tapes, and dressings includes sterile and non-sterile options suitable for various wound care applications. All products meet international medical standards and are suitable for hospitals, clinics, and healthcare facilities.',
    pricing: {
      basePrice: 'From 50',
      currency: 'KES',
      unit: 'per box',
      minOrder: '10 boxes'
    },
    specifications: [
      { label: 'Material', value: 'Medical-grade fabric and adhesive' },
      { label: 'Sterility', value: 'Sterile and non-sterile options' },
      { label: 'Sizes', value: 'Multiple sizes available' },
      { label: 'Packaging', value: 'Individual boxes or bulk orders' }
    ],
    features: [
      'Hypoallergenic adhesive',
      'Breathable material',
      'Easy application and removal',
      'Long-lasting adhesion',
      'Water-resistant options available'
    ]
  },
  {
    id: 'bottles-containers',
    slug: 'bottles-and-containers',
    name: 'Bottles and Containers',
    image: 'https://images.pexels.com/photos/5921726/pexels-photo-5921726.jpeg?w=500&h=400&fit=crop',
    description: 'Sterile containers for specimen collection and storage',
    longDescription: 'Medical-grade bottles and containers for specimen collection, sample storage, and laboratory use. Our containers are manufactured with food-grade plastics and meet all regulatory requirements for medical use.',
    pricing: {
      basePrice: '5',
      currency: 'KES',
      unit: 'per piece',
      minOrder: '100 pieces'
    },
    specifications: [
      { label: 'Material', value: 'Food-grade plastic and glass options' },
      { label: 'Capacity', value: '5ml to 500ml' },
      { label: 'Sterility', value: 'Pre-sterilized' },
      { label: 'Closure', value: 'Screw cap, snap cap, and push-pin options' }
    ],
    features: [
      'Clear visibility for specimen inspection',
      'Graduated markings',
      'Chemical resistant',
      'Leakproof design',
      'Autoclavable options'
    ]
  },
  {
    id: 'catheters-tubes',
    slug: 'catheters-and-tubes',
    name: 'Catheters and Tubes',
    image: 'https://images.pexels.com/photos/8442032/pexels-photo-8442032.jpeg?w=500&h=400&fit=crop',
    description: 'Medical-grade catheters and tubing systems',
    longDescription: 'Complete range of catheters and tubes including urinary, nasogastric, endotracheal, and feeding tubes. All products are manufactured from medical-grade materials and meet international safety standards.',
    pricing: {
      basePrice: '150',
      currency: 'KES',
      unit: 'per unit',
      minOrder: '50 units'
    },
    specifications: [
      { label: 'Types', value: 'Urinary, NG, endotracheal, feeding' },
      { label: 'Material', value: 'Silicone, latex-free PVC, or polyurethane' },
      { label: 'Sizes', value: '12Fr to 28Fr' },
      { label: 'Sterility', value: 'Pre-sterilized, individually packaged' }
    ],
    features: [
      'Smooth insertion coating',
      'Radiopaque for X-ray visibility',
      'Double lumen options',
      'Latex-free materials',
      'Individually sterile packed'
    ]
  },
  {
    id: 'cotton-wool',
    slug: 'cotton-wool',
    name: 'Cotton Wool',
    image: 'https://images.pexels.com/photos/6129902/pexels-photo-6129902.jpeg?w=500&h=400&fit=crop',
    description: 'High-quality absorbent cotton products',
    longDescription: 'Pure, high-quality cotton wool suitable for medical applications, wound care, and general use in healthcare facilities. Our cotton wool is naturally absorbent and gentle on skin.',
    pricing: {
      basePrice: '200',
      currency: 'KES',
      unit: 'per kg',
      minOrder: '5 kg'
    },
    specifications: [
      { label: 'Composition', value: '100% pure cotton' },
      { label: 'Weight', value: 'Bulk rolls or individual packages' },
      { label: 'Purity', value: 'Bleached and dyed variants' },
      { label: 'Packaging', value: 'Vacuum-sealed rolls' }
    ],
    features: [
      'High absorbency',
      'Soft and gentle',
      'Lint-free option',
      'Non-irritating',
      'Cost-effective'
    ]
  },
  {
    id: 'diapers-sanitary',
    slug: 'diapers-and-sanitary',
    name: 'Diapers and Sanitary',
    image: 'https://images.pexels.com/photos/7692272/pexels-photo-7692272.jpeg?w=500&h=400&fit=crop',
    description: 'Adult and pediatric incontinence products',
    longDescription: 'Comprehensive range of incontinence management products for both adults and pediatric patients. All products feature advanced moisture-absorbing technology and skin-friendly materials.',
    pricing: {
      basePrice: '800',
      currency: 'KES',
      unit: 'per pack',
      minOrder: '10 packs'
    },
    specifications: [
      { label: 'Types', value: 'Adult, pediatric, unisex' },
      { label: 'Sizes', value: 'XS to XXL' },
      { label: 'Absorbency', value: 'Light, regular, heavy, super-heavy' },
      { label: 'Features', value: 'Wetness indicators, odor control' }
    ],
    features: [
      'Advanced absorption technology',
      'Breathable material',
      'Hypoallergenic',
      'Dermatologically tested',
      'Eco-friendly options'
    ]
  },
  {
    id: 'gloves',
    slug: 'gloves',
    name: 'Gloves',
    image: 'https://images.pexels.com/photos/4021267/pexels-photo-4021267.jpeg?w=500&h=400&fit=crop',
    description: 'Medical examination and surgical gloves',
    longDescription: 'High-quality medical gloves for examination and surgical use. Available in latex, nitrile, and latex-free options. All gloves are sterile, pre-powdered or powder-free, and meet international medical standards.',
    pricing: {
      basePrice: '15',
      currency: 'KES',
      unit: 'per pair',
      minOrder: '100 pairs'
    },
    specifications: [
      { label: 'Material', value: 'Latex, nitrile, or polyisoprene' },
      { label: 'Type', value: 'Examination or surgical' },
      { label: 'Powder', value: 'Powdered or powder-free' },
      { label: 'Sterility', value: 'Sterile and non-sterile' }
    ],
    features: [
      'Superior grip',
      'High tear resistance',
      'Latex-free options',
      'AQL 1.5 standard',
      'Individually packed or bulk'
    ]
  },
  {
    id: 'hospital-equipments',
    slug: 'hospital-equipments',
    name: 'Hospital Equipments',
    image: 'https://images.pexels.com/photos/3844581/pexels-photo-3844581.jpeg?w=500&h=400&fit=crop',
    description: 'Advanced medical equipment and monitors',
    longDescription: 'State-of-the-art hospital equipment including vital sign monitors, oxygen concentrators, suction machines, and diagnostic equipment. All equipment is certified, fully functional, and backed by comprehensive warranty.',
    pricing: {
      basePrice: 'Custom',
      currency: 'KES',
      unit: 'per unit',
      minOrder: '1 unit'
    },
    specifications: [
      { label: 'Categories', value: 'Monitoring, oxygen, suction, diagnostic' },
      { label: 'Brand', value: 'ISO certified manufacturers' },
      { label: 'Warranty', value: '1-2 years warranty' },
      { label: 'Certification', value: 'CE, FDA approved' }
    ],
    features: [
      'Digital displays',
      'Portable options',
      'Multiple alarm features',
      'Data logging capability',
      'Easy maintenance'
    ]
  },
  {
    id: 'hospital-furniture',
    slug: 'hospital-furniture',
    name: 'Hospital Furniture',
    image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?w=500&h=400&fit=crop',
    description: 'Hospital beds, trolleys, and medical furniture',
    longDescription: 'Durable and comfortable hospital furniture including adjustable beds, trolleys, examination tables, and storage solutions. All furniture is designed for easy cleaning and long-term durability.',
    pricing: {
      basePrice: '5000',
      currency: 'KES',
      unit: 'per piece',
      minOrder: '1 piece'
    },
    specifications: [
      { label: 'Materials', value: 'Stainless steel, medical-grade plastic, wood' },
      { label: 'Types', value: 'Beds, trolleys, tables, cabinets' },
      { label: 'Features', value: 'Adjustable, mobile, lockable' },
      { label: 'Finish', value: 'Powder-coated, polished' }
    ],
    features: [
      'Ergonomic design',
      'Easy to clean',
      'Durable construction',
      'Weight capacity rated',
      'Customizable options'
    ]
  },
  {
    id: 'hospital-instruments',
    slug: 'hospital-instruments',
    name: 'Hospital Instruments',
    image: 'https://images.pexels.com/photos/4269355/pexels-photo-4269355.jpeg?w=500&h=400&fit=crop',
    description: 'Surgical and diagnostic instruments',
    longDescription: 'Comprehensive range of surgical and diagnostic instruments manufactured from high-quality stainless steel. All instruments are precision-engineered and suitable for surgical, diagnostic, and clinical applications.',
    pricing: {
      basePrice: '500',
      currency: 'KES',
      unit: 'per instrument',
      minOrder: '10 pieces'
    },
    specifications: [
      { label: 'Material', value: 'Surgical-grade stainless steel' },
      { label: 'Types', value: 'Forceps, scissors, clamps, specula' },
      { label: 'Finish', value: 'Mirror polished or matt' },
      { label: 'Sterilization', value: 'Autoclavable' }
    ],
    features: [
      'Precision engineering',
      'Non-corrosive',
      'Sharp and durable blades',
      'Ergonomic handles',
      'Lifetime durability'
    ]
  },
  {
    id: 'hospital-linen',
    slug: 'hospital-linen',
    name: 'Hospital Linen',
    image: 'https://images.pexels.com/photos/4108807/pexels-photo-4108807.jpeg?w=500&h=400&fit=crop',
    description: 'Medical-grade sheets, pillows, and linens',
    longDescription: 'Medical-grade bed linens, pillows, and blankets designed for hospital and healthcare facility use. Our linens are durable, easy to clean, and maintain hygiene standards.',
    pricing: {
      basePrice: '300',
      currency: 'KES',
      unit: 'per piece',
      minOrder: '20 pieces'
    },
    specifications: [
      { label: 'Material', value: '100% cotton or cotton-polyester blend' },
      { label: 'Types', value: 'Sheets, pillows, blankets, covers' },
      { label: 'Thread count', value: '200+ TC' },
      { label: 'Sizes', value: 'Single, double, queen' }
    ],
    features: [
      'Hypoallergenic',
      'High thread count',
      'Machine washable',
      'Fade-resistant',
      'Quick-drying'
    ]
  },
  {
    id: 'infection-control',
    slug: 'infection-control',
    name: 'Infection Control',
    image: 'https://images.pexels.com/photos/5128226/pexels-photo-5128226.jpeg?w=500&h=400&fit=crop',
    description: 'Disinfectants, sanitizers, and safety equipment',
    longDescription: 'Complete infection control solutions including hospital-grade disinfectants, hand sanitizers, and safety equipment. All products are EPA-approved and effective against bacteria, viruses, and fungi.',
    pricing: {
      basePrice: '800',
      currency: 'KES',
      unit: 'per liter',
      minOrder: '5 liters'
    },
    specifications: [
      { label: 'Types', value: 'Surface disinfectants, hand sanitizers, sterilants' },
      { label: 'Active ingredients', value: 'Alcohol, chlorine, quaternary ammonium' },
      { label: 'Effectiveness', value: 'Effective against COVID-19, bacteria, fungi' },
      { label: 'Packaging', value: '1L, 5L, 20L containers' }
    ],
    features: [
      'Broad-spectrum action',
      'Fast-acting formula',
      'Safe for healthcare workers',
      'Cost-effective',
      'Non-corrosive'
    ]
  },
  {
    id: 'ppe',
    slug: 'ppe',
    name: 'PPE',
    image: 'https://images.pexels.com/photos/3951356/pexels-photo-3951356.jpeg?w=500&h=400&fit=crop',
    description: 'Personal protective equipment and safety gear',
    longDescription: 'Comprehensive personal protective equipment (PPE) including face masks, gowns, face shields, and protective aprons. All products meet international safety standards and provide excellent protection.',
    pricing: {
      basePrice: '20',
      currency: 'KES',
      unit: 'per piece',
      minOrder: '100 pieces'
    },
    specifications: [
      { label: 'Items', value: 'Masks, gowns, shields, aprons, goggles' },
      { label: 'Levels', value: 'Level 1, 2, and 3' },
      { label: 'Material', value: 'Non-woven fabrics, polycarbonate' },
      { label: 'Certification', value: 'CE, FDA certified' }
    ],
    features: [
      'Comfortable fit',
      'Long-wearing comfort',
      'Breathable materials',
      'Latex-free',
      'Cost-effective'
    ]
  },
  {
    id: 'spirits-detergents',
    slug: 'spirits-detergents-and-disinfectants',
    name: 'Spirits, Detergents and Disinfectants',
    image: 'https://images.pexels.com/photos/4099260/pexels-photo-4099260.jpeg?w=500&h=400&fit=crop',
    description: 'Cleaning and sterilization products',
    longDescription: 'Professional-grade cleaning and sterilization products for hospitals and healthcare facilities. Our range includes isopropyl alcohol, surgical spirits, and hospital-grade detergents.',
    pricing: {
      basePrice: '600',
      currency: 'KES',
      unit: 'per liter',
      minOrder: '5 liters'
    },
    specifications: [
      { label: 'Types', value: 'Isopropyl alcohol, surgical spirits, detergents' },
      { label: 'Concentration', value: '70%, 95%, or 100%' },
      { label: 'Uses', value: 'Surface cleaning, instrument sterilization' },
      { label: 'Packaging', value: '1L, 5L, 20L bottles' }
    ],
    features: [
      'Hospital-grade strength',
      'Rapid evaporation',
      'Non-toxic formulation',
      'Pleasant odor',
      'Economical'
    ]
  },
  {
    id: 'syringes-needles',
    slug: 'syringes-and-needles',
    name: 'Syringes and Needles',
    image: 'https://images.pexels.com/photos/7723193/pexels-photo-7723193.jpeg?w=500&h=400&fit=crop',
    description: 'Sterile syringes and hypodermic needles',
    longDescription: 'Sterile, disposable syringes and needles for medical use. All products are individually packaged, pre-sterilized, and meet international medical standards. Available in various sizes and gauges.',
    pricing: {
      basePrice: '5',
      currency: 'KES',
      unit: 'per unit',
      minOrder: '100 units'
    },
    specifications: [
      { label: 'Syringe sizes', value: '1ml to 60ml' },
      { label: 'Needle gauges', value: '25G to 18G' },
      { label: 'Tip type', value: 'Luer lock or slip' },
      { label: 'Sterility', value: 'Sterile, pre-sterilized' }
    ],
    features: [
      'Clear measurement markings',
      'Luer lock compatibility',
      'Latex-free plungers',
      'Sharp needles',
      'Individually sterile packed'
    ]
  },
  {
    id: 'others',
    slug: 'others',
    name: 'Others',
    image: 'https://images.pexels.com/photos/6129902/pexels-photo-6129902.jpeg?w=500&h=400&fit=crop',
    description: 'Additional medical supplies and accessories',
    longDescription: 'Miscellaneous medical supplies and healthcare accessories including thermometers, blood pressure monitors, stethoscopes, and other diagnostic aids. All products are high-quality and reliable.',
    pricing: {
      basePrice: 'Varies',
      currency: 'KES',
      unit: 'per unit',
      minOrder: 'Varies'
    },
    specifications: [
      { label: 'Items', value: 'Various medical accessories' },
      { label: 'Quality', value: 'Medical-grade materials' },
      { label: 'Certification', value: 'ISO, FDA approved' },
      { label: 'Support', value: 'Technical support available' }
    ],
    features: [
      'Wide variety',
      'Competitive pricing',
      'Reliable quality',
      'Technical support',
      'Bulk discounts available'
    ]
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(product => product.slug === slug);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};
