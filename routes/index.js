var express = require('express');
var router = express.Router();
const dbs = require('../utils/dbs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', async (req, res, next) => {
  let rs = await dbs.execute('select * from city');
  res.send(rs);
});

module.exports = router;
