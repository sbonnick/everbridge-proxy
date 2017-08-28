
function dayDateRange(date, days = 1) {
  date = (typeof date !== 'undefined') ? new Date(date).toISOString().slice(0,10) : (new Date()).toISOString().slice(0,10);

  startDate = new Date(date);
  endDate   = new Date(date);
  endDate.setTime( endDate.getTime() + days * 86400000 );

  return {
    start: startDate,
    end:   endDate
  }
}

function inDateRange(dateRange1, dateRange2) {
  return (dateRange1.start >= dateRange2.start && dateRange1.start <= dateRange2.end) ||
       (dateRange2.start >= dateRange1.start && dateRange2.start <= dateRange1.end);
}


module.exports = {
  dayDateRange: dayDateRange,
  inDateRange:  inDateRange
};