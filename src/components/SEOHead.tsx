import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: any;
}

export const SEOHead = ({
  title = 'Andhra Sweets - Premium Traditional Sweets & Snacks',
  description = 'Discover authentic Andhra Pradesh sweets and snacks. Premium quality traditional sweets like Gulab Jamun, Mysore Pak, Pootharekulu delivered fresh to your door.',
  keywords = 'andhra sweets, traditional sweets, gulab jamun, mysore pak, pootharekulu, indian sweets, premium sweets, authentic sweets',
  image = '/images/hero-gulab-jamun.jpg',
  url,
  type = 'website',
  structuredData
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImageUrl, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Andhra Sweets', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImageUrl);

    // Additional SEO tags
    updateMetaTag('author', 'Andhra Sweets');
    updateMetaTag('theme-color', '#8B5CF6');

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Structured data
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Remove any dynamically added structured data
      if (structuredData) {
        const scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
        if (scriptTag) {
          scriptTag.remove();
        }
      }
    };
  }, [title, description, keywords, fullImageUrl, currentUrl, type, structuredData]);

  return null; // This component doesn't render anything
};

// Predefined SEO configurations for different page types
export const getProductSEO = (product: any): SEOHeadProps => ({
  title: `${product.name} - Premium Andhra Sweets`,
  description: `${product.description} Fresh, authentic ${product.name} delivered to your door. Rating: ${product.rating}/5 stars.`,
  keywords: `${product.name}, andhra sweets, traditional sweets, ${product.category?.name || ''}`,
  image: product.image_url,
  type: 'product',
  structuredData: {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
    brand: {
      '@type': 'Brand',
      name: 'Andhra Sweets'
    }
  }
});

export const getCategorySEO = (category: string): SEOHeadProps => ({
  title: `${category} - Traditional Andhra Sweets Collection`,
  description: `Explore our premium ${category.toLowerCase()} collection. Authentic, fresh, and made with traditional recipes from Andhra Pradesh.`,
  keywords: `${category}, andhra sweets, traditional sweets, indian sweets, premium quality`,
  type: 'website',
  structuredData: {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    name: `${category} Collection`,
    description: `Premium ${category.toLowerCase()} from Andhra Pradesh`,
    url: window.location.href,
  }
});

export const getHomeSEO = (): SEOHeadProps => ({
  title: 'Andhra Sweets - Premium Traditional Sweets & Snacks Online',
  description: 'Order authentic Andhra Pradesh sweets online. Premium Gulab Jamun, Mysore Pak, Pootharekulu & more traditional sweets delivered fresh nationwide.',
  keywords: 'andhra sweets online, traditional indian sweets, gulab jamun, mysore pak, pootharekulu, buy sweets online, premium sweets delivery',
  type: 'website',
  structuredData: {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    name: 'Andhra Sweets',
    description: 'Premium traditional sweets and snacks from Andhra Pradesh',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
});