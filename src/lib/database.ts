import { supabase } from './supabaseClient';

export interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  percentage: number;
  created_at: string;
}

export interface WeeklyResult {
  id: string;
  week_id: string;
  admin_capital_start: number;
  user_capital_start: number;
  admin_pnl: number;
  user_pnl: number;
  fee_generated: number;
  admin_capital_end: number;
  user_capital_end: number;
  hwm_after: number;
}

export interface CapitalLedger {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PERFORMANCE_FEE';
  amount: number;
  note: string | null;
  created_at: string;
}

export interface FinancialState {
  admin_capital: number;
  user_capital: number;
  hwm: number;
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
}

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) return null;
  return data?.role;
}

export async function getAdminId() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'ADMIN')
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data?.id;
}

export async function getUserId() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'USER')
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data?.id;
}

export async function getWeeks(): Promise<Week[]> {
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function createWeek(weekData: {
  week_number: number;
  start_date: string;
  end_date: string;
  percentage: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('weeks')
    .insert([
      {
        ...weekData,
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await recalculateAll(true);
  return data;
}

export async function deleteWeek(weekId: string) {
  const { error } = await supabase
    .from('weeks')
    .delete()
    .eq('id', weekId);

  if (error) throw error;

  await recalculateAll(true);
}

export async function updateWeek(
  weekId: string,
  updates: { percentage?: number }
) {
  const { error } = await supabase
    .from('weeks')
    .update(updates)
    .eq('id', weekId);

  if (error) throw error;

  await recalculateAll(true);
}

export async function getWeeklyResults(): Promise<WeeklyResult[]> {
  const { data, error } = await supabase
    .from('weekly_results')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getCapitalLedger(): Promise<CapitalLedger[]> {
  const { data, error } = await supabase
    .from('capital_ledger')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function addCapitalEntry(entry: {
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  note?: string;
}) {
  const { data, error } = await supabase
    .from('capital_ledger')
    .insert([entry])
    .select()
    .single();

  if (error) throw error;

  await recalculateAll(true);
  return data;
}

export async function getFinancialState(): Promise<FinancialState | null> {
  const { data, error } = await supabase
    .from('financial_state')
    .select('admin_capital, user_capital, hwm')
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function recalculateAll(feeReinvest: boolean = true) {
  const { data, error } = await supabase.rpc('recalculate_all', {
    p_fee_reinvest: feeReinvest,
  });

  if (error) throw error;
  return data;
}

export async function getWeeksWithResults(): Promise<
  (Week & { result: WeeklyResult | null })[]
> {
  const weeks = await getWeeks();
  const results = await getWeeklyResults();

  return weeks.map((week) => ({
    ...week,
    result: results.find((r) => r.week_id === week.id) || null,
  }));
}

export async function getCapitalForUser(userId: string) {
  const { data, error } = await supabase
    .from('capital_ledger')
    .select('type, amount')
    .eq('user_id', userId);

  if (error) return { deposits: 0, withdrawals: 0 };

  const deposits = data
    ?.filter((item) => item.type === 'DEPOSIT')
    .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  const withdrawals = data
    ?.filter((item) => item.type === 'WITHDRAWAL')
    .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  return { deposits, withdrawals, net: deposits - withdrawals };
}
