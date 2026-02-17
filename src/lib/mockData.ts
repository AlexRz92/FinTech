export const mockAdminData = {
  capitalAdmin: 125000,
  capitalUser: 120000,
  totalFund: 245000,
  hwmCurrent: 256000,
  accumulatedReturn: 11.0,
  activeUsers: 42,
  totalWeeks: 12,
  pendingWithdrawals: 5,
  weeklyGrowth: 8.5,
};

export const mockUserData = {
  username: 'juan_perez',
  name: 'Juan Pérez',
  initialCapital: 5000,
  currentCapital: 6420,
  totalProfit: 1420,
  weeklyReturn: 7.2,
  lastUpdate: '2024-01-15',
  nextDistribution: '2024-01-22',
};

export const mockWeeks = [
  {
    id: 1,
    weekNumber: 1,
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    status: 'completed',
    totalCapitalAdmin: 125000,
    totalCapitalUser: 75000,
    pnlAdmin: 9750,
    pnlUser: 5250,
    percentage: 7.5,
    fee: 1200,
    capitalFinalAdmin: 134750,
    capitalFinalUser: 80250,
  },
  {
    id: 2,
    weekNumber: 2,
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    status: 'completed',
    totalCapitalAdmin: 134750,
    totalCapitalUser: 80250,
    pnlAdmin: 10780,
    pnlUser: 6420,
    percentage: 8.0,
    fee: 1368,
    capitalFinalAdmin: 145530,
    capitalFinalUser: 86670,
  },
  {
    id: 3,
    weekNumber: 3,
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    status: 'completed',
    totalCapitalAdmin: 145530,
    totalCapitalUser: 86670,
    pnlAdmin: -5600,
    pnlUser: -3360,
    percentage: -3.2,
    fee: 0,
    capitalFinalAdmin: 139930,
    capitalFinalUser: 83310,
  },
  {
    id: 4,
    weekNumber: 4,
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    status: 'completed',
    totalCapitalAdmin: 139930,
    totalCapitalUser: 83310,
    pnlAdmin: 11193,
    pnlUser: 6664,
    percentage: 8.0,
    fee: 1344,
    capitalFinalAdmin: 151123,
    capitalFinalUser: 89974,
  },
  {
    id: 5,
    weekNumber: 5,
    startDate: '2024-01-29',
    endDate: '2024-02-04',
    status: 'active',
    totalCapitalAdmin: 151123,
    totalCapitalUser: 89974,
    pnlAdmin: 0,
    pnlUser: 0,
    percentage: 0,
    fee: 0,
    capitalFinalAdmin: 151123,
    capitalFinalUser: 89974,
  },
];

export const mockUsers = [
  {
    id: 1,
    username: 'juan_perez',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    initialCapital: 5000,
    currentCapital: 6420,
    status: 'active',
    joinDate: '2024-01-01',
  },
  {
    id: 2,
    username: 'maria_gomez',
    name: 'María Gómez',
    email: 'maria@example.com',
    initialCapital: 10000,
    currentCapital: 12850,
    status: 'active',
    joinDate: '2024-01-01',
  },
  {
    id: 3,
    username: 'carlos_ruiz',
    name: 'Carlos Ruiz',
    email: 'carlos@example.com',
    initialCapital: 7500,
    currentCapital: 9638,
    status: 'active',
    joinDate: '2024-01-05',
  },
  {
    id: 4,
    username: 'ana_lopez',
    name: 'Ana López',
    email: 'ana@example.com',
    initialCapital: 8000,
    currentCapital: 10240,
    status: 'active',
    joinDate: '2024-01-10',
  },
];

export const mockWithdrawals = [
  {
    id: 1,
    userId: 1,
    userName: 'Juan Pérez',
    amount: 500,
    requestDate: '2024-01-14',
    status: 'pending',
  },
  {
    id: 2,
    userId: 2,
    userName: 'María Gómez',
    amount: 1000,
    requestDate: '2024-01-13',
    status: 'pending',
  },
  {
    id: 3,
    userId: 3,
    userName: 'Carlos Ruiz',
    amount: 750,
    requestDate: '2024-01-10',
    status: 'completed',
  },
];

export const mockCapitalHistory = [
  {
    id: 1,
    type: 'admin_deposit',
    amount: 50000,
    date: '2024-01-01',
    note: 'Initial fund',
  },
  {
    id: 2,
    type: 'user_deposit',
    amount: 5000,
    date: '2024-01-01',
    note: 'Juan Pérez signup',
  },
  {
    id: 3,
    type: 'admin_withdrawal',
    amount: 5000,
    date: '2024-01-10',
    note: 'Profit distribution',
  },
  {
    id: 4,
    type: 'user_withdrawal',
    amount: 500,
    date: '2024-01-14',
    note: 'User request',
  },
];

export const mockChartData = [
  { week: 'W1', adminCapital: 125000, userCapital: 75000 },
  { week: 'W2', adminCapital: 134750, userCapital: 80250 },
  { week: 'W3', adminCapital: 139930, userCapital: 83310 },
  { week: 'W4', adminCapital: 151123, userCapital: 89974 },
  { week: 'W5', adminCapital: 151123, userCapital: 89974 },
];

export const getAdminDashboardData = () => mockAdminData;
export const getUserDashboardData = () => mockUserData;
export const getWeeksData = () => mockWeeks;
export const getUsersData = () => mockUsers;
export const getWithdrawalsData = () => mockWithdrawals;
export const getCapitalHistoryData = () => mockCapitalHistory;
export const getChartData = () => mockChartData;
