import { supabase } from '@/integrations/supabase/client';

export interface WebCategoryForPublic {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  display_order: number;
  variant_count?: number;
}

export interface WebVariantForPublic {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  slug: string;
  description?: string;
  image_path?: string;
  display_order: number;
}

/**
 * Fetch all active categories for public display
 */
export const getActiveCategories = async (): Promise<WebCategoryForPublic[]> => {
  try {
    const { data, error } = await supabase
      .from('web_categories_with_counts')
      .select('id, name, slug, icon, description, display_order, variant_count')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active categories:', error);
    return [];
  }
};

/**
 * Fetch a specific category by slug with its active variants
 */
export const getCategoryBySlugWithVariants = async (
  slug: string
): Promise<{
  category?: WebCategoryForPublic;
  variants: WebVariantForPublic[];
} | null> => {
  try {
    // Fetch category
    const { data: categoryData, error: categoryError } = await supabase
      .from('web_categories')
      .select('id, name, slug, icon, description, display_order')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (categoryError) throw categoryError;

    // Fetch variants for this category
    let variants: WebVariantForPublic[] = [];
    if (categoryData) {
      const { data: variantsData, error: variantsError } = await supabase
        .from('web_variants')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (variantsError) throw variantsError;
      variants = (variantsData || []).map((v: any) => ({
        ...v,
        image_path: v.image_path || v.image_url || null,
      })) as WebVariantForPublic[];
    }

    return {
      category: categoryData || undefined,
      variants,
    };
  } catch (error) {
    console.error('Error fetching category with variants:', error);
    return null;
  }
};

/**
 * Fetch all active variants (optionally filtered by category)
 */
export const getActiveVariants = async (
  categoryId?: string
): Promise<WebVariantForPublic[]> => {
  try {
    let query = supabase
      .from('web_variants')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((v: any) => ({
      ...v,
      image_path: v.image_path || v.image_url || null,
    })) as WebVariantForPublic[];
  } catch (error) {
    console.error('Error fetching active variants:', error);
    return [];
  }
};

/**
 * Fetch a specific variant by slug
 */
export const getVariantBySlug = async (slug: string): Promise<WebVariantForPublic | null> => {
  try {
    const { data, error } = await supabase
      .from('web_variants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        ...data,
        image_path: (data as any).image_path || (data as any).image_url || null,
      } as WebVariantForPublic;
    }
    return null;
  } catch (error) {
    console.error('Error fetching variant by slug:', error);
    return null;
  }
};

/**
 * Get category names for navigation/dropdown (optimized for UI)
 */
export const getCategoryNames = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('web_categories')
      .select('name')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data?.map((cat) => cat.name) || [];
  } catch (error) {
    console.error('Error fetching category names:', error);
    return [];
  }
};

/**
 * Search variants by term (public search) - returns specific variant matches
 */
export const searchVariants = async (term: string, limit = 10): Promise<WebVariantForPublic[]> => {
  if (!term || term.trim().length < 2) return [];
  try {
    const sanitized = term.trim().replace(/[%_]/g, '');
    const { data, error } = await supabase
      .from('web_variants')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${sanitized}%,sku.ilike.%${sanitized}%,slug.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
      .order('display_order', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((v: any) => ({
      ...v,
      image_path: v.image_path || v.image_url || null,
    })) as WebVariantForPublic[];
  } catch (error) {
    console.error('Error searching variants:', error);
    return [];
  }
};
