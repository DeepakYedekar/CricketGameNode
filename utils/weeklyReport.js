const moment = require('moment');

exports.getWeeksOfCurrentMonth = () => {
  const now = moment();
  const monthStart = now.clone().startOf('month');
  const monthEnd = now.clone().endOf('month');

  // Start from the first Friday *on or before* the start of the month
  let currentFriday = monthStart.clone();
  while (currentFriday.day() !== 5) {
    currentFriday.subtract(1, 'days');
  }

  const weeks = [];
  let weekNo = 1;

  while (currentFriday.isBefore(monthEnd)) {
    const startDate = currentFriday.clone();
    const endDate = currentFriday.clone().add(6, 'days');

    // Only include weeks that overlap with the current month
    if (endDate.isSameOrAfter(monthStart)) {
      weeks.push({
        weekNo: weekNo++,
        startDate,
        endDate
      });
    }

    currentFriday.add(7, 'days');
  }

  return weeks;
}