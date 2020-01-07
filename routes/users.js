var express = require('express');
var router = express.Router();
const dbs = require('../utils/dbs');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});


router.get('/testdb',async function(req, res) {
  let rs = await dbs.execute('select * from city');
  res.send(rs);
});

module.exports = router;
