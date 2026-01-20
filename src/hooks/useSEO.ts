import { useEffect } from 'react';
import {
  updateMetaTags,
  addStructuredData,
  removeStructuredDataByType,
  generateWebPageSchema,
  generateProductSchema,
  SEOMetadata
} from '@/utils/seoHelpers';

/**
 * Hook to manage SEO for a page
 * Updates meta tags, og tags, and structured data
 */
export const useSEO = (metadata: SEOMetadata, structuredData?: any) => {
  useEffect(() => {
    // Update all meta tags
    updateMetaTags(metadata);

    // Add structured data
    if (structuredData) {
      // Remove any existing schema of the same type to prevent duplicates
      removeStructuredDataByType(structuredData['@type']);
      addStructuredData(structuredData);
    } else {
      // Default to WebPage schema if none provided
      const webPageSchema = generateWebPageSchema(metadata);
      removeStructuredDataByType('WebPage');
      addStructuredData(webPageSchema);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, [metadata, structuredData]);
};

/**
 * Hook specifically for product pages
 */
export const useProductSEO = (product: {
  name: string;
  description: string;
  image?: string;
  url?: string;
  category?: string;
}) => {
  const metadata: SEOMetadata = {
    title: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    type: 'product',
    keywords: `${product.name}, medical supplies, ${product.category || 'healthcare products'}`,
  };

  useSEO(metadata, generateProductSchema(product));
};
