'use strict';

const app      = require('express')();
const cors     = require('cors');
const bodyPars = require('body-parser');
const Promise  = require("bluebird");
const eb       = require('./src/queryEverbridge');
const search   = require('./src/searchResults');
const util     = require('./src/utils');

const PORT         = process.env.PORT || 8080;
const HOST         = process.env.HOST || '0.0.0.0';
const USERNAME     = process.env.USER;
const PASSWORD     = process.env.PASS;
const ORGANIZATION = process.env.ORG;

app.use(bodyPars.json());
app.use(cors({credentials: true, origin: true}))

eb.connection(USERNAME, PASSWORD, ORGANIZATION);

app.get('/', (req, res) => {
  res.send(require('./src/defaultRoute').response(req, app))
})

app.get('/contacts/:group', (req, res) => {
  eb.getContacts(req.params.group)
    .then(data   => search.allPageData(data))
    .then(result => res.send(result));
});

app.get('/calendars', (req, res) => {
  eb.getCalendars()
    .then(data   => search.allPageData(data))
    .then(result => res.send(result));
});

app.get('/calendars/:calendarId', (req, res) => {
  eb.getCalendars()
    .then(data   => search.forCalendar(req.params.calendarId, data))
    .then(result => res.send(result));
});

app.get('/calendars/:calendarId/assignment/:date?/:days?', (req, res) => {
  var dateRange = util.dayDateRange(req.params.date, req.params.days)
  eb.getCalendars()
    .then(data   => search.forCalendar(req.params.calendarId, data))
    .then(data   => eb.getAssignments(data.data[0].externalId, dateRange))
    .then(data   => search.allAssignmentsData(data))
    .then(result => res.send(result));
});

app.get('/calendars/:calendarId/substitutions', (req, res) => {
  eb.getSubstitutions(req.params.calendarId)
    .then(data   => search.allData(data))
    .then(result => res.send(result));
});

app.get('/calendars/:calendarId/substitutions/:date/:days', (req, res) => {
  var dateRange = util.dayDateRange(req.params.date, req.params.days)
  eb.getSubstitutions(req.params.calendarId)
    .then(data   => search.forSubstitutions(dateRange, data))
    .then(result => res.send(result));
});

app.post('/calendars/:calendarId/substitutions', (req, res) => {
  eb.setSubstitution(req.params.calendarId, req.body.contactId, req.body.replacementId, {
       start: new Date(req.body.start),
       end:   new Date(req.body.end)
    }).then(result => res.send(result));
});

app.delete('/calendars/:calendarId/substitutions/:substitutionId', (req, res) => {
  eb.removeSubstitution(req.params.substitutionId)
    .then(result => res.send(result));
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`)
})