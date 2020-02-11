const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const privateRoutePartner = require('./partnerprivate');

privateRoutePartner(router);
module.exports = router;
