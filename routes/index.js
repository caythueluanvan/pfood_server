const express = require('express');
const router = express.Router();
const dbs = require('../utils/dbs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', async (req, res, next) => {
  let rs = await dbs.getNextID('customer','customerid');
  res.send(rs);
});

router.get('/city', async (req, res, next) => {
  let rs = await dbs.execute(`select * from city`,[]);
  res.send(rs);
});

router.post('/signin', async function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  try {
    let user = await dbs.execute('select * from customer where CustomerUsername = ?',[username]);    
    if (user[0]) {
      let rs = bcrypt.compareSync(password, user[0].CustomerPassword);      
      if (rs) {
        delete user[0].CustomerPassword;
        let path = await dbs.execute('SELECT gp.path, gp.post, gp.get, gp.put, gp.del from group_permission gp, map_user_group mug, customer cu where gp.group_id=mug.group_id and mug.user_id= cu.CustomerID and cu.CustomerUsername =  ?',[username]);
        var token = jwt.sign(JSON.parse(JSON.stringify(user[0])), config.secret, { expiresIn: config.expires });
        res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000), user: user[0], path: path });
      } else {
        res.status(401).send({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
      }
    } else {
      res.status(401).send({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
    }
  } catch (error) {
    res.status(401).send({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
  }
});

module.exports = router;
