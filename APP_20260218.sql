--
-- PostgreSQL database dump
--

\restrict h6jVLhYBhPnXWpBpxGLI2c9PuwyAEuMmA4rzQbj8cOHtZd9Ok3kBNhFneZOEd6P

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-18 14:02:11

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
-- TOC entry 40 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 40
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1205 (class 1247 OID 17465)
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'ADMIN',
    'USER'
);


--
-- TOC entry 1208 (class 1247 OID 17470)
-- Name: ledger_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ledger_type AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'PERFORMANCE_FEE'
);


--
-- TOC entry 485 (class 1255 OID 17615)
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
RETURN EXISTS (
SELECT 1 FROM public.profiles
WHERE public.profiles.id = auth.uid()
AND public.profiles.role = 'ADMIN'
);
END;
$$;


--
-- TOC entry 484 (class 1255 OID 17542)
-- Name: is_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin(uid uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid and p.role = 'ADMIN'
  );
$$;


--
-- TOC entry 487 (class 1255 OID 19018)
-- Name: recalculate_all(boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalculate_all(p_fee_reinvest boolean DEFAULT true) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
v_admin_id uuid;
v_user_id uuid;
v_admin_capital numeric;
v_user_capital numeric;
v_current_hwm numeric;
v_fs_id uuid;
v_week_record record;
v_prev_admin_end numeric;
v_prev_user_end numeric;
v_final_admin_capital numeric;
v_final_user_capital numeric;
BEGIN
-- Get admin and user IDs
SELECT id INTO v_admin_id FROM profiles WHERE role = 'ADMIN' LIMIT 1;
SELECT id INTO v_user_id FROM profiles WHERE role = 'USER' LIMIT 1;

IF v_admin_id IS NULL OR v_user_id IS NULL THEN
RETURN jsonb_build_object('success', false, 'message', 'Admin or User not found');
END IF;

-- Calculate base capital (deposits - withdrawals) excluding PERFORMANCE_FEE
SELECT COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount WHEN type = 'WITHDRAWAL' THEN -amount ELSE 0 END), 0)
INTO v_admin_capital
FROM capital_ledger
WHERE user_id = v_admin_id AND type != 'PERFORMANCE_FEE';

SELECT COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount WHEN type = 'WITHDRAWAL' THEN -amount ELSE 0 END), 0)
INTO v_user_capital
FROM capital_ledger
WHERE user_id = v_user_id AND type != 'PERFORMANCE_FEE';

-- Get current HWM
SELECT id, hwm INTO v_fs_id, v_current_hwm FROM financial_state LIMIT 1;
IF v_current_hwm IS NULL THEN
v_current_hwm := GREATEST(v_admin_capital, v_user_capital);
END IF;

-- Initialize previous end capitals
v_prev_admin_end := v_admin_capital;
v_prev_user_end := v_user_capital;
v_final_admin_capital := v_admin_capital;
v_final_user_capital := v_user_capital;

-- Process each week in order
FOR v_week_record IN 
SELECT w.id, w.week_number, w.percentage
FROM weeks w
ORDER BY w.week_number ASC
LOOP
-- Delete existing result for this week to recalculate
DELETE FROM weekly_results WHERE week_id = v_week_record.id;

-- Insert new result using cumulative capital
INSERT INTO weekly_results (
week_id,
admin_capital_start,
user_capital_start,
admin_pnl,
user_pnl,
fee_generated,
admin_capital_end,
user_capital_end,
hwm_after
) VALUES (
v_week_record.id,
v_prev_admin_end,
v_prev_user_end,
ROUND((v_prev_admin_end * v_week_record.percentage / 100)::numeric, 2),
ROUND((v_prev_user_end * v_week_record.percentage / 100)::numeric, 2),
ROUND((v_prev_user_end * v_week_record.percentage / 100 * 0.2)::numeric, 2),
ROUND((v_prev_admin_end + v_prev_admin_end * v_week_record.percentage / 100)::numeric, 2),
ROUND((v_prev_user_end + v_prev_user_end * v_week_record.percentage / 100)::numeric, 2),
GREATEST(v_current_hwm, ROUND((v_prev_admin_end + v_prev_admin_end * v_week_record.percentage / 100)::numeric, 2))
);

-- Update previous end capitals for next iteration
v_prev_admin_end := ROUND((v_prev_admin_end + v_prev_admin_end * v_week_record.percentage / 100)::numeric, 2);
v_prev_user_end := ROUND((v_prev_user_end + v_prev_user_end * v_week_record.percentage / 100)::numeric, 2);
v_current_hwm := GREATEST(v_current_hwm, v_prev_admin_end);

-- Track final capital values
v_final_admin_capital := v_prev_admin_end;
v_final_user_capital := v_prev_user_end;
END LOOP;

-- Update or insert into financial_state
IF v_fs_id IS NOT NULL THEN
UPDATE financial_state SET
admin_capital = v_final_admin_capital,
user_capital = v_final_user_capital,
hwm = v_current_hwm,
updated_at = now()
WHERE id = v_fs_id;
ELSE
INSERT INTO financial_state (admin_capital, user_capital, hwm, created_at)
VALUES (v_final_admin_capital, v_final_user_capital, v_current_hwm, now())
ON CONFLICT DO NOTHING;
END IF;

-- Update capital_net in profiles for user
UPDATE profiles SET capital_net = v_final_user_capital WHERE id = v_user_id;

-- Update capital_net in profiles for admin
UPDATE profiles SET capital_net = v_final_admin_capital WHERE id = v_admin_id;

RETURN jsonb_build_object(
'success', true,
'admin_capital', v_final_admin_capital,
'user_capital', v_final_user_capital,
'hwm', v_current_hwm
);
END;
$$;


--
-- TOC entry 486 (class 1255 OID 18946)
-- Name: update_capital_net(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_capital_net() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
UPDATE profiles
SET capital_net = COALESCE(
(
SELECT SUM(CASE WHEN type = 'DEPOSIT' THEN amount WHEN type = 'WITHDRAWAL' THEN -amount ELSE 0 END)
FROM capital_ledger
WHERE user_id = profiles.id
), 0
)
WHERE id = NEW.user_id;
RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 365 (class 1259 OID 17635)
-- Name: capital_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capital_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric(18,8) NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT capital_ledger_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT capital_ledger_type_check CHECK ((type = ANY (ARRAY['DEPOSIT'::text, 'WITHDRAWAL'::text, 'PERFORMANCE_FEE'::text])))
);


--
-- TOC entry 367 (class 1259 OID 17706)
-- Name: financial_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_capital numeric(18,8) DEFAULT 0 NOT NULL,
    user_capital numeric(18,8) DEFAULT 0 NOT NULL,
    hwm numeric(18,8) DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 363 (class 1259 OID 17572)
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text,
    username text,
    role text DEFAULT 'USER'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    capital_net numeric DEFAULT 0,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['ADMIN'::text, 'USER'::text])))
);


--
-- TOC entry 366 (class 1259 OID 17653)
-- Name: weekly_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    week_id uuid NOT NULL,
    admin_capital_start numeric(18,8) DEFAULT 0 NOT NULL,
    user_capital_start numeric(18,8) DEFAULT 0 NOT NULL,
    admin_pnl numeric(18,8) DEFAULT 0 NOT NULL,
    user_pnl numeric(18,8) DEFAULT 0 NOT NULL,
    fee_generated numeric(18,8) DEFAULT 0 NOT NULL,
    admin_capital_end numeric(18,8) DEFAULT 0 NOT NULL,
    user_capital_end numeric(18,8) DEFAULT 0 NOT NULL,
    hwm_after numeric(18,8) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 364 (class 1259 OID 17621)
-- Name: weeks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weeks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    week_number integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    percentage numeric(18,8) NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 3666 (class 2606 OID 17645)
-- Name: capital_ledger capital_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capital_ledger
    ADD CONSTRAINT capital_ledger_pkey PRIMARY KEY (id);


--
-- TOC entry 3674 (class 2606 OID 17716)
-- Name: financial_state financial_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_state
    ADD CONSTRAINT financial_state_pkey PRIMARY KEY (id);


--
-- TOC entry 3657 (class 2606 OID 17581)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 3659 (class 2606 OID 17583)
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- TOC entry 3669 (class 2606 OID 17667)
-- Name: weekly_results weekly_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_results
    ADD CONSTRAINT weekly_results_pkey PRIMARY KEY (id);


--
-- TOC entry 3672 (class 2606 OID 17669)
-- Name: weekly_results weekly_results_week_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_results
    ADD CONSTRAINT weekly_results_week_id_key UNIQUE (week_id);


--
-- TOC entry 3661 (class 2606 OID 17627)
-- Name: weeks weeks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weeks
    ADD CONSTRAINT weeks_pkey PRIMARY KEY (id);


--
-- TOC entry 3663 (class 2606 OID 17629)
-- Name: weeks weeks_week_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weeks
    ADD CONSTRAINT weeks_week_number_key UNIQUE (week_number);


--
-- TOC entry 3664 (class 1259 OID 17652)
-- Name: capital_ledger_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX capital_ledger_created_at_idx ON public.capital_ledger USING btree (created_at);


--
-- TOC entry 3667 (class 1259 OID 17651)
-- Name: capital_ledger_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX capital_ledger_user_id_idx ON public.capital_ledger USING btree (user_id);


--
-- TOC entry 3670 (class 1259 OID 17675)
-- Name: weekly_results_week_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX weekly_results_week_id_idx ON public.weekly_results USING btree (week_id);


--
-- TOC entry 3680 (class 2620 OID 18947)
-- Name: capital_ledger update_capital_net_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_capital_net_trigger AFTER INSERT OR DELETE OR UPDATE ON public.capital_ledger FOR EACH ROW EXECUTE FUNCTION public.update_capital_net();


--
-- TOC entry 3677 (class 2606 OID 17646)
-- Name: capital_ledger capital_ledger_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capital_ledger
    ADD CONSTRAINT capital_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 3679 (class 2606 OID 17717)
-- Name: financial_state financial_state_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_state
    ADD CONSTRAINT financial_state_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- TOC entry 3675 (class 2606 OID 17584)
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3678 (class 2606 OID 17670)
-- Name: weekly_results weekly_results_week_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_results
    ADD CONSTRAINT weekly_results_week_id_fkey FOREIGN KEY (week_id) REFERENCES public.weeks(id) ON DELETE CASCADE;


--
-- TOC entry 3676 (class 2606 OID 17630)
-- Name: weeks weeks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weeks
    ADD CONSTRAINT weeks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- TOC entry 3849 (class 3256 OID 18945)
-- Name: financial_state Allow function to insert financial state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow function to insert financial state" ON public.financial_state FOR INSERT TO authenticated WITH CHECK (true);


--
-- TOC entry 3848 (class 3256 OID 17723)
-- Name: financial_state Only admins can update financial state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update financial state" ON public.financial_state FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text)))));


--
-- TOC entry 3847 (class 3256 OID 17722)
-- Name: financial_state Only admins can view financial state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view financial state" ON public.financial_state FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'ADMIN'::text)))));


--
-- TOC entry 3831 (class 0 OID 17635)
-- Dependencies: 365
-- Name: capital_ledger; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.capital_ledger ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3833 (class 0 OID 17706)
-- Dependencies: 367
-- Name: financial_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financial_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3837 (class 3256 OID 17683)
-- Name: capital_ledger ledger_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ledger_admin_delete ON public.capital_ledger FOR DELETE TO authenticated USING (public.is_admin());


--
-- TOC entry 3835 (class 3256 OID 17681)
-- Name: capital_ledger ledger_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ledger_admin_insert ON public.capital_ledger FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- TOC entry 3836 (class 3256 OID 17682)
-- Name: capital_ledger ledger_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ledger_admin_update ON public.capital_ledger FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 3834 (class 3256 OID 17680)
-- Name: capital_ledger ledger_select_own_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ledger_select_own_or_admin ON public.capital_ledger FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- TOC entry 3829 (class 0 OID 17572)
-- Dependencies: 363
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3842 (class 3256 OID 17620)
-- Name: profiles profiles_delete_admin_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_delete_admin_only ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());


--
-- TOC entry 3840 (class 3256 OID 17618)
-- Name: profiles profiles_insert_admin_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_admin_only ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- TOC entry 3839 (class 3256 OID 17617)
-- Name: profiles profiles_select_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_admin_all ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());


--
-- TOC entry 3838 (class 3256 OID 17616)
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING ((id = auth.uid()));


--
-- TOC entry 3841 (class 3256 OID 17619)
-- Name: profiles profiles_update_admin_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_admin_only ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 3832 (class 0 OID 17653)
-- Dependencies: 366
-- Name: weekly_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_results ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3846 (class 3256 OID 17679)
-- Name: weekly_results weekly_results_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY weekly_results_admin_all ON public.weekly_results TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 3845 (class 3256 OID 17678)
-- Name: weekly_results weekly_results_select_auth; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY weekly_results_select_auth ON public.weekly_results FOR SELECT TO authenticated USING (true);


--
-- TOC entry 3830 (class 0 OID 17621)
-- Dependencies: 364
-- Name: weeks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3844 (class 3256 OID 17677)
-- Name: weeks weeks_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY weeks_admin_all ON public.weeks TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 3843 (class 3256 OID 17676)
-- Name: weeks weeks_select_auth; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY weeks_select_auth ON public.weeks FOR SELECT TO authenticated USING (true);


-- Completed on 2026-02-18 14:02:23

--
-- PostgreSQL database dump complete
--

\unrestrict h6jVLhYBhPnXWpBpxGLI2c9PuwyAEuMmA4rzQbj8cOHtZd9Ok3kBNhFneZOEd6P

