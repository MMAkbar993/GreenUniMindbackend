const protectTeacher = (req, res, next) => {
  const teacherId = req.params.teacherId;
  const currentUserId = req.user?._id?.toString();
  if (currentUserId !== teacherId) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  next();
};

export const getUpcomingPayout = async (req, res) => {
  res.json({
    success: true,
    data: {
      amount: 0,
      currency: 'USD',
      expectedDate: null,
      status: 'pending',
      payoutSchedule: {
        interval: 'monthly',
        monthlyAnchor: 1,
        weeklyAnchor: null,
        delayDays: 2,
      },
    },
  });
};

export const getTeacherEarnings = async (req, res) => {
  res.json({
    success: true,
    data: {
      totalEarnings: 0,
      monthlyEarnings: 0,
      weeklyEarnings: 0,
      dailyEarnings: 0,
      totalCoursesSold: 0,
      avgPerCourse: 0,
      transactions: [],
    },
  });
};

export const getPayoutInfo = async (req, res) => {
  res.json({
    success: true,
    data: {
      currentPeriod: { month: '', year: '', earnings: 0 },
      monthlyBreakdown: [],
      availableBalance: 0,
      pendingBalance: 0,
    },
  });
};

export const getTeacherTransactions = async (req, res) => {
  res.json({ success: true, data: [] });
};

export const getPayoutHistory = async (req, res) => {
  res.json({ success: true, data: [] });
};

export const getPayoutPreferences = async (req, res) => {
  res.json({ success: true, data: null });
};

export const getEarningsGrowth = async (req, res) => {
  res.json({ success: true, data: { growth: 0, period: req.query.period || '12m' } });
};

export const getRevenueChart = async (req, res) => {
  res.json({ success: true, data: [] });
};

export const getFinancialSummary = async (req, res) => {
  res.json({
    success: true,
    data: {
      total: 0,
      monthly: 0,
      weekly: 0,
      daily: 0,
      growth: { yearly: 0, monthly: 0, weekly: 0, daily: 0 },
    },
  });
};

export const getTopPerformingCourses = async (req, res) => {
  res.json({ success: true, data: [] });
};
