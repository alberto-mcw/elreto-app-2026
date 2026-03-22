import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check sessionStorage cache to avoid repeated DB queries per session
      const cacheKey = `admin:${user.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached !== null) {
        setIsAdmin(cached === 'true');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) { console.error('Error checking admin role:', error); }
        setIsAdmin(false);
      } else {
        const result = !!data;
        sessionStorage.setItem(cacheKey, String(result));
        setIsAdmin(result);
      }
      setLoading(false);
    };

    checkAdminRole();
  }, [user]);

  // Invalidate cache on sign-out (user becomes null)
  useEffect(() => {
    if (!user) {
      // Clear all admin cache entries on sign-out
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('admin:')) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    }
  }, [user]);

  return { isAdmin, loading };
};
