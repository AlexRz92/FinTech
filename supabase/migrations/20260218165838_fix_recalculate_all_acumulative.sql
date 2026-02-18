/*
  # Fix recalculate_all to use cumulative capital

  1. Problem: Capital calculations are not cumulative
     - Week 1: START=$100, END=$105
     - Week 2: START=$100 (WRONG - should be $105)
     - Week 3: START=$100 (WRONG - should be $108.15)

  2. Solution: Use previous week's end capital as next week's start capital
     - Recreate the recalculate_all function with proper cumulative logic
     - Each week uses the previous week's ending capital as its starting capital
     - This ensures compound growth is calculated correctly

  3. Changes:
     - Drop and recreate recalculate_all function
     - Implement proper cumulative capital tracking across weeks
     - Calculate PnL based on previous week's ending capital
*/

DROP FUNCTION IF EXISTS public.recalculate_all(boolean);

CREATE OR REPLACE FUNCTION public.recalculate_all(p_fee_reinvest boolean = true)
RETURNS jsonb AS $$
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
  END LOOP;

  -- Get final capital values for financial_state
  SELECT COALESCE(admin_capital_end, 0) INTO v_admin_capital
  FROM weekly_results
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT COALESCE(user_capital_end, 0) INTO v_user_capital
  FROM weekly_results
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no weekly results, use base capital
  IF v_admin_capital = 0 THEN
    SELECT COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount WHEN type = 'WITHDRAWAL' THEN -amount ELSE 0 END), 0)
    INTO v_admin_capital
    FROM capital_ledger
    WHERE user_id = v_admin_id AND type != 'PERFORMANCE_FEE';
  END IF;

  IF v_user_capital = 0 THEN
    SELECT COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount WHEN type = 'WITHDRAWAL' THEN -amount ELSE 0 END), 0)
    INTO v_user_capital
    FROM capital_ledger
    WHERE user_id = v_user_id AND type != 'PERFORMANCE_FEE';
  END IF;

  -- Update or insert into financial_state
  IF v_fs_id IS NOT NULL THEN
    UPDATE financial_state SET
      admin_capital = v_admin_capital,
      user_capital = v_user_capital,
      hwm = v_current_hwm,
      updated_at = now()
    WHERE id = v_fs_id;
  ELSE
    INSERT INTO financial_state (admin_capital, user_capital, hwm, created_at)
    VALUES (v_admin_capital, v_user_capital, v_current_hwm, now())
    ON CONFLICT DO NOTHING;
  END IF;

  -- Update capital_net in profiles for user
  UPDATE profiles SET capital_net = v_user_capital WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'admin_capital', v_admin_capital,
    'user_capital', v_user_capital,
    'hwm', v_current_hwm
  );
END;
$$ LANGUAGE plpgsql;
