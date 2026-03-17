import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChefEvent {
  id: string;
  title: string;
  description: string | null;
  chef_name: string;
  chef_avatar_url: string | null;
  twitch_url: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  ingredients: any[];
  utensils: any[];
  rules: string | null;
  evaluation_criteria: string | null;
  cover_image_url: string | null;
  final_dish_image_url: string | null;
  energy_reward: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChefEventStep {
  id: string;
  event_id: string;
  step_number: number;
  title: string;
  description: string | null;
  duration_seconds: number;
  photo_required: boolean;
  reference_image_url: string | null;
  tips: string | null;
  created_at: string;
}

export interface ChefParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  finished_at: string | null;
  current_step: number;
  total_score: number | null;
  status: string;
}

export interface ChefStepSubmission {
  id: string;
  participant_id: string;
  step_id: string;
  photo_url: string | null;
  submitted_at: string;
  time_taken_seconds: number | null;
  status: string;
}

export const useChefEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ChefEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chef_events')
      .select('*')
      .order('scheduled_at', { ascending: true });
    
    if (!error) setEvents((data || []) as unknown as ChefEvent[]);
    setLoading(false);
  };

  const fetchEventSteps = async (eventId: string) => {
    const { data } = await supabase
      .from('chef_event_steps')
      .select('*')
      .eq('event_id', eventId)
      .order('step_number', { ascending: true });
    return (data || []) as unknown as ChefEventStep[];
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return { error: new Error('No user') };
    const { data, error } = await supabase
      .from('chef_event_participants')
      .insert({ event_id: eventId, user_id: user.id })
      .select()
      .single();
    return { data: data as unknown as ChefParticipant, error };
  };

  const getParticipation = async (eventId: string) => {
    if (!user) return null;
    const { data } = await supabase
      .from('chef_event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();
    return data as unknown as ChefParticipant | null;
  };

  const submitStepPhoto = async (participantId: string, stepId: string, photoUrl: string, timeTaken: number) => {
    const { data, error } = await supabase
      .from('chef_step_submissions')
      .insert({
        participant_id: participantId,
        step_id: stepId,
        photo_url: photoUrl,
        time_taken_seconds: timeTaken,
        status: 'submitted'
      })
      .select()
      .single();
    return { data: data as unknown as ChefStepSubmission, error };
  };

  const updateParticipantStep = async (participantId: string, step: number) => {
    await supabase
      .from('chef_event_participants')
      .update({ current_step: step })
      .eq('id', participantId);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    fetchEventSteps,
    joinEvent,
    getParticipation,
    submitStepPhoto,
    updateParticipantStep,
  };
};
