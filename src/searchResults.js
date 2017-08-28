
var util = require('./utils');

function forCalendar(id, calendars) {
  for (var i = 0; i < calendars.page.data.length; i++) {
    if (calendars.page.data[i].id == id) {
      return { data: [calendars.page.data[i]] };
    }
  }              
}

function forSubstitutions(dateRange, data) {
  var subs = [];
  for (var i = 0; i < data.data.length; i++) {
    recurrence = {
      start: new Date(data.data[i].recurrence.datesApplicable.from),
      end: new Date(data.data[i].recurrence.datesApplicable.to),
    }
    if (util.inDateRange(dateRange, recurrence)) {
      subs.push(data.data[i]);
    }
  }
  return { data: subs};
}

function allData(data) {
  return {data: data.data};
}

function allPageData(data) {
  return {data: data.page.data};
}

function allAssignmentsData(data) {
  return {data: data.result.staffAssignments};
}


module.exports = {
  forCalendar: forCalendar,
  forSubstitutions: forSubstitutions,
  allData: allData,
  allPageData: allPageData,
  allAssignmentsData: allAssignmentsData
};