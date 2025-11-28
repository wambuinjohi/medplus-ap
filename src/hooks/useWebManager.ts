import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface WebCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  variant_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WebVariant {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  slug: string;
  description?: string;
  image_path?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface VariantFormData {
  category_id: string;
  name: string;
  sku: string;
  slug: string;
  description?: string;
  image_path?: string;
  display_order: number;
  is_active: boolean;
}

export const useWebManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categories
  const fetchCategories = useCallback(
    async (search?: string, limit?: number) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('web_categories_with_counts')
          .select('*')
          .order('display_order', { ascending: true });

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: err } = await query;

        if (err) throw err;
        return data as WebCategory[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(message);
        toast.error(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createCategory = useCallback(async (data: CategoryFormData) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: newCategory, error: err } = await supabase
        .from('web_categories')
        .insert({
          ...data,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (err) throw err;
      toast.success('Category created successfully');
      return newCategory as WebCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: CategoryFormData) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: updated, error: err } = await supabase
        .from('web_categories')
        .update({
          ...data,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      toast.success('Category updated successfully');
      return updated as WebCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('web_categories')
        .delete()
        .eq('id', id);

      if (err) throw err;
      toast.success('Category deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCategoryStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: err } = await supabase
        .from('web_categories')
        .update({
          is_active: isActive,
          updated_by: user?.id,
        })
        .eq('id', id);

      if (err) throw err;
      toast.success(`Category ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle category status';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  // Variants
  const fetchVariants = useCallback(async (categoryId?: string, search?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('web_variants')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      return data as WebVariant[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch variants';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createVariant = useCallback(async (data: VariantFormData) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: newVariant, error: err } = await supabase
        .from('web_variants')
        .insert({
          ...data,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (err) throw err;
      toast.success('Variant created successfully');
      return newVariant as WebVariant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create variant';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVariant = useCallback(async (id: string, data: VariantFormData) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: updated, error: err } = await supabase
        .from('web_variants')
        .update({
          ...data,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      toast.success('Variant updated successfully');
      return updated as WebVariant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update variant';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVariant = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('web_variants')
        .delete()
        .eq('id', id);

      if (err) throw err;
      toast.success('Variant deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete variant';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleVariantStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: err } = await supabase
        .from('web_variants')
        .update({
          is_active: isActive,
          updated_by: user?.id,
        })
        .eq('id', id);

      if (err) throw err;
      toast.success(`Variant ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle variant status';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    // Categories
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    // Variants
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    toggleVariantStatus,
  };
};
