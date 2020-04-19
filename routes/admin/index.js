const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const privateRouteAdmin = require('./adminprivate');


privateRouteAdmin(router);

module.exports = router;
