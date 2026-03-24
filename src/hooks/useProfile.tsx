import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  alias: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  auth_provider: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle: string | null;
  total_energy: number;
  pending_transfer_notification: { from_name: string; amount: number } | null;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no profile exists, check by email first (handles password-reset duplicate accounts)
      if (!data) {
        if (user.email) {
          // Use SECURITY DEFINER function to bypass RLS for re-linking
          const { data: relinkedId } = await supabase
            .rpc('relink_profile_by_email', { p_user_id: user.id, p_email: user.email });

          if (relinkedId) {
            // Profile was re-linked — fetch it now
            const { data: relinked } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', relinkedId)
              .single();
            if (relinked) {
              setProfile(relinked);
              return;
            }
          }
        }

        const FOOD_EMOJIS = ['🍕','🍷','🥐','🍣','☕','🍞','🍾','🍜','🦪','🍰','🔪','🍏','🌯','🍫','🍔','🧋','🍝','🍦','🥘','🍪'];
        const userMetadata = user.user_metadata || {};
        const displayName = userMetadata.display_name || user.email?.split('@')[0] || 'Usuario';
        const avatarUrl = userMetadata.avatar_url || userMetadata.picture || FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: displayName,
            avatar_url: avatarUrl
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);

        // Show transfer notification once, then clear it
        const notif = (data as any).pending_transfer_notification;
        if (notif?.from_name && notif?.amount) {
          toast({
            title: `⚡ ${notif.from_name} te ha donado ${notif.amount.toLocaleString()} puntos`,
            duration: 6000,
          });
          supabase
            .from('profiles')
            .update({ pending_transfer_notification: null } as any)
            .eq('user_id', user!.id);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) { console.error('Error fetching profile:', error); }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('No user logged in'), url: null };

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return { error: null, url: publicUrl };
    } catch (error) {
      return { error: error as Error, url: null };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, updateProfile, uploadAvatar, refetch: fetchProfile };
};
