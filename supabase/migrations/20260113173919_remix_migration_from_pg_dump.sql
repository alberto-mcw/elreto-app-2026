CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: award_energy_on_like(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.award_energy_on_like() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  video_owner_id uuid;
BEGIN
  -- Get the owner of the video
  SELECT user_id INTO video_owner_id
  FROM public.challenge_submissions
  WHERE id = NEW.submission_id;
  
  -- Award 1 energy point to video owner (not self-likes)
  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    UPDATE public.profiles
    SET total_energy = total_energy + 1,
        updated_at = now()
    WHERE user_id = video_owner_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: increment_user_energy(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_user_energy(p_user_id uuid, p_amount integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET total_energy = total_energy + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;


--
-- Name: update_likes_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_likes_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_submissions
    SET likes_count = likes_count + 1
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_submissions
    SET likes_count = likes_count - 1
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_energy_on_completion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_energy_on_completion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET total_energy = total_energy + NEW.energy_earned,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: challenge_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    energy_earned integer NOT NULL
);


--
-- Name: challenge_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id uuid NOT NULL,
    video_url text NOT NULL,
    thumbnail_url text,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT challenge_submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    challenge_type text NOT NULL,
    energy_reward integer DEFAULT 25 NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    starts_at date NOT NULL,
    ends_at date NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['daily'::text, 'weekly'::text])))
);


--
-- Name: daily_trivias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_trivias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scheduled_date date NOT NULL,
    trivia_type text DEFAULT 'trivia'::text NOT NULL,
    title text NOT NULL,
    question text NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    correct_answer integer NOT NULL,
    explanation text NOT NULL,
    fun_fact text NOT NULL,
    difficulty text DEFAULT 'medio'::text NOT NULL,
    energy_reward integer DEFAULT 25 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    email text,
    avatar_url text,
    bio text,
    city text,
    instagram_handle text,
    tiktok_handle text,
    twitter_handle text,
    total_energy integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: social_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_email text NOT NULL,
    platform text DEFAULT 'instagram'::text NOT NULL,
    action_type text DEFAULT 'follow'::text NOT NULL,
    energy_earned integer DEFAULT 50 NOT NULL,
    verified_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL
);


--
-- Name: video_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    submission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: challenge_completions challenge_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_pkey PRIMARY KEY (id);


--
-- Name: challenge_completions challenge_completions_user_id_challenge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_challenge_id_key UNIQUE (user_id, challenge_id);


--
-- Name: challenge_submissions challenge_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_submissions
    ADD CONSTRAINT challenge_submissions_pkey PRIMARY KEY (id);


--
-- Name: challenge_submissions challenge_submissions_user_id_challenge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_submissions
    ADD CONSTRAINT challenge_submissions_user_id_challenge_id_key UNIQUE (user_id, challenge_id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: daily_trivias daily_trivias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_trivias
    ADD CONSTRAINT daily_trivias_pkey PRIMARY KEY (id);


--
-- Name: daily_trivias daily_trivias_scheduled_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_trivias
    ADD CONSTRAINT daily_trivias_scheduled_date_key UNIQUE (scheduled_date);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: social_verifications social_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_verifications
    ADD CONSTRAINT social_verifications_pkey PRIMARY KEY (id);


--
-- Name: social_verifications social_verifications_user_email_platform_action_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_verifications
    ADD CONSTRAINT social_verifications_user_email_platform_action_type_key UNIQUE (user_email, platform, action_type);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: video_likes video_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_pkey PRIMARY KEY (id);


--
-- Name: video_likes video_likes_user_id_submission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_user_id_submission_id_key UNIQUE (user_id, submission_id);


--
-- Name: idx_daily_trivias_scheduled_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_trivias_scheduled_date ON public.daily_trivias USING btree (scheduled_date);


--
-- Name: idx_daily_trivias_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_trivias_status ON public.daily_trivias USING btree (status);


--
-- Name: challenge_completions on_challenge_completed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_challenge_completed AFTER INSERT ON public.challenge_completions FOR EACH ROW EXECUTE FUNCTION public.update_user_energy_on_completion();


--
-- Name: video_likes on_video_like; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_video_like AFTER INSERT ON public.video_likes FOR EACH ROW EXECUTE FUNCTION public.award_energy_on_like();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: video_likes update_submission_likes_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_submission_likes_count AFTER INSERT OR DELETE ON public.video_likes FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();


--
-- Name: challenge_completions challenge_completions_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: challenge_completions challenge_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenge_submissions challenge_submissions_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_submissions
    ADD CONSTRAINT challenge_submissions_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: challenge_submissions challenge_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_submissions
    ADD CONSTRAINT challenge_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenges challenges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: video_likes video_likes_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.challenge_submissions(id) ON DELETE CASCADE;


--
-- Name: challenges Admins can manage challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage challenges" ON public.challenges USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: challenge_submissions Admins can manage submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage submissions" ON public.challenge_submissions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: daily_trivias Admins can manage trivias; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage trivias" ON public.daily_trivias USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: social_verifications Anyone can insert their verification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert their verification" ON public.social_verifications FOR INSERT WITH CHECK (true);


--
-- Name: challenges Anyone can view active challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active challenges" ON public.challenges FOR SELECT USING ((is_active = true));


--
-- Name: challenge_submissions Anyone can view approved submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved submissions" ON public.challenge_submissions FOR SELECT USING (((status = 'approved'::text) OR (auth.uid() = user_id)));


--
-- Name: daily_trivias Anyone can view approved trivias; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved trivias" ON public.daily_trivias FOR SELECT USING (((status = 'approved'::text) AND (scheduled_date <= CURRENT_DATE)));


--
-- Name: video_likes Anyone can view likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view likes" ON public.video_likes FOR SELECT USING (true);


--
-- Name: social_verifications Anyone can view verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view verifications" ON public.social_verifications FOR SELECT USING (true);


--
-- Name: challenge_completions Users can complete challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can complete challenges" ON public.challenge_completions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: video_likes Users can like videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can like videos" ON public.video_likes FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: challenge_submissions Users can submit their videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit their videos" ON public.challenge_submissions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: video_likes Users can unlike videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unlike videos" ON public.video_likes FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: challenge_submissions Users can update their pending submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their pending submissions" ON public.challenge_submissions FOR UPDATE USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: profiles Users can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);


--
-- Name: challenge_completions Users can view their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own completions" ON public.challenge_completions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: challenge_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_trivias; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_trivias ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: social_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: video_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;