var express = require('express');
var router = express.Router();
const dbs = require('../utils/dbs');
var jwt = require('jsonwebtoken');
var config = require('../utils/config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', async (req, res, next) => {
  let rs = await dbs.execute('select * from city where CityID = ?', [1]);
  res.send(rs);
});

router.post('/signin', async function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  try {
    let user = await User.findOne({username: username});

    if (user) {
      User.comparePassword(password, user.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(JSON.parse(JSON.stringify(user)), config.secret, { expiresIn: config.expires });
          // return the information including token as JSON
          res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000) });

        } else {
          res.status(401).send({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
        }
      });

    } else {
      res.status(401).send({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
  }
});

module.exports = router;
