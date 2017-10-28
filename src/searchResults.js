
var util = require('./utils');

function forCalendar(id, calendars) {
  for (var i = 0; i < calendars.page.data.length; i++) {
    if (calendars.page.data[i].id == id) {
      return { data: [calendars.page.data[i]] };
    }
  }              
}

function forRecurrence(dateRange, data) {
  var rec = [];
  for (var i = 0; i < data.data.length; i++) {
    var candidate = false;
    if (data.data[i].recurrence.type == 'occurrence') {
      candidate = util.dayRangeMatch(dateRange, data.data[i].recurrence.datesApplicable)
    } else if (data.data[i].recurrence.type == 'ical') {
      var recurrence = {
        start: new Date(data.data[i].recurrence.datesApplicable.from),
        end: new Date(data.data[i].recurrence.datesApplicable.to),
      }
      candidate = util.inDateRange(dateRange, recurrence)
    }
    if (candidate) rec.push(data.data[i]);
  }
  return { data: rec};
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
  forRecurrence: forRecurrence,
  allData: allData,
  allPageData: allPageData,
  allAssignmentsData: allAssignmentsData
};