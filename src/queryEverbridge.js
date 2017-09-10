var request = require('request-promise');
require('string.format');
var moment  = require('moment-timezone');
var cache   = require('memory-cache');

//TODO: expose this as env or auto detect
const tz = "America/New_York";
const tzFormat = 'YYYY-MM-DDTHH:mm:ss';
const _ebBaseUrl = 'https://api.everbridge.net/rest';
var _baseRequest;
var _orgId;
var _cacheTimeouts = {
  contacts:   undefined,
  calendars:  undefined,
  assignment: undefined
};

cache.debug(true);

//TODO: assuming UTC. should either auto-discover or leave conversion to the UI and pass through time zone
function convertDate(date, zone) {
  var src = moment.tz(date.toISOString(), 'UTC');
  var tor = src.clone().tz(zone);
  return tor;
}

function connection(user, pass, organizationId) {
  _baseRequest = request.defaults({
    auth: {
      user: user,
      pass: pass,
      sendImmediately: true
    },
    json: true
  });

  _orgId = organizationId;
}


function cacheTimouts(contacts, calendar) {
  _cacheTimeouts = {
    contacts: contacts,
    calendars: calendar
  }
}

function getContacts(groupId) {
  var cached = cache.get('contacts-{id}'.format({id: groupId}))
  if (cached != null) return cached;

  var url = '{baseUrl}/contacts/{org}?pageNumber=1&groupIds={group}&searchType=AND'.format({
    baseUrl: _ebBaseUrl,
    org:     _orgId,
    group:   groupId
  });

  var query = _baseRequest({uri: url, method: "GET"})
  cache.put('contacts-{id}'.format({id: groupId}), query, _cacheTimeouts.contacts);

  return query;
}

function getCalendars() {
  var cached = cache.get('calendars-{org}'.format({org: _orgId}))
  if (cached != null) return cached;

  var url = '{baseUrl}/calendars/{org}'.format({
    baseUrl: _ebBaseUrl,
    org:     _orgId
  });
  
  var query = _baseRequest({uri: url, method: "GET"});   
  cache.put('calendars-{org}'.format({org: _orgId}), query, _cacheTimeouts.calendars);
  
  return query;  
}

//TODO: handle paging
function getAssignments(calendarExtId, dateRange) {

  var url = '{baseUrl}/staff/{org}/assignment/{calExt}?from={start}&to={end}'.format({
    baseUrl: _ebBaseUrl,
    org:     _orgId,
    calExt:  calendarExtId,
    start:   dateRange.start.toISOString().replace(/:/g, '%3A'),
    end:     dateRange.end.toISOString().replace(/:/g, '%3A')
  });

  return _baseRequest({uri: url, method: "GET"})  
}

//TODO: handle paging
function getSubstitutions(calendarId) {

  var url = '{baseUrl}/scheduling/{org}/substitutions?include=contact&filter%5BcalendarId%5D={cal}&pageSize=50'.format({
    baseUrl: _ebBaseUrl,
    org:     _orgId,
    cal:     calendarId,
  });

  return _baseRequest({uri: url, method: "GET"})  
}

function setSubstitution(calendarId, sourceContact, syncContact, dateRange) {

  var url = '{baseUrl}/scheduling/{org}/substitutions'.format({
    baseUrl: _ebBaseUrl,
    org:     _orgId
  });

  var payload = {
    "data": {
      "type": "staffSubstitution",
      "calendarId": calendarId,
      "contactId": sourceContact,
      "recurrence": {
        "type": "ical",
        "event": {
          "end": convertDate(dateRange.end, tz).format(tzFormat),
          "start": convertDate(dateRange.start, tz).format(tzFormat)
        }
      },
      "staffAssignment": {
        "type": "contact",
        "contactIds": [ syncContact ]
      },
      "timeZoneString": tz
    }
  }

  return _baseRequest({uri: url, method: "POST", json: payload})
}

function removeSubstitution(substitutionId) {

  var url = '{baseUrl}/scheduling/{org}/substitutions/{sub}'.format({
    baseUrl: _ebBaseUrl,
    org:     _orgId,
    sub:     substitutionId,
  });

  return _baseRequest({uri: url, method: "DELETE"})
}

module.exports = {
  connection: connection,
  cacheTimouts: cacheTimouts,
  getContacts: getContacts,
  getCalendars: getCalendars,
  getAssignments: getAssignments,
  getSubstitutions: getSubstitutions,
  setSubstitution: setSubstitution,
  removeSubstitution: removeSubstitution
};