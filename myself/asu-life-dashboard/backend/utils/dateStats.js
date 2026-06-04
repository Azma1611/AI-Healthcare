export const todayKey = () => new Date().toISOString().split('T')[0];

export const isWithinDays = (dateValue, days) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return date >= start;
};

export const sumAmounts = (items) =>
  items.reduce((total, item) => total + Number(item.amount || 0), 0);

export const moneyStats = (items) => ({
  total: sumAmounts(items),
  weekly: sumAmounts(items.filter((item) => isWithinDays(item.date, 7))),
  monthly: sumAmounts(items.filter((item) => isWithinDays(item.date, 31))),
});
