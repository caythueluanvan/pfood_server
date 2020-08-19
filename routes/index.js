const express = require('express');
const router = express.Router();
const dbs = require('../utils/dbs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const bcrypt = require('bcryptjs');
const { check, validationResult, body } = require('express-validator');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', async (req, res, next) => {
  console.log(req.body);

  res.send(req.body);
});

router.get('/city', async (req, res, next) => {
  let rs = await dbs.execute(`select * from city`, []);
  res.send(rs);
});

router.get('/category', async (req, res, next) => {
  let rs = await dbs.execute(`select * from category`, []);
  res.send(rs);
});

router.post('/testreject', async (req, res, next) => {
  let username = req.body.username;

  let user = await dbs.execute('select * from customer where CustomerUsername = ?', [username]);
  if (user[0].CountReject >= 5) {
    let locktime = await dbs.execute(`select paramvalue from parameters where paramname = 'lock_time'`, []);
    let fromReject = new Date(user[0].LockStartTime);
    let toReject = new Date(user[0].LockStartTime);
    toReject.setDate(fromReject.getDate() + locktime[0].paramvalue)
    console.log(toReject.getDate());

    if (toReject < new Date()) {

    } else {
      let a = Math.ceil((toReject - new Date()) / (24 * 60 * 60 * 1000));
      console.log(a);

    }

  }
  res.json(user);
});

router.post('/signin', async function (req, res) {
  let phone = req.body.phone;
  let password = req.body.password;  
  try {
    let user = await dbs.execute('select * from customer where CustomerPhone = ?', [phone]);
    
    if (user[0]) {
      let rejectmax = await dbs.execute(`select paramvalue from parameters where paramname = 'reject_max'`, []);
      if (user[0].CountReject >= rejectmax[0].paramvalue) {
        
        let locktime = await dbs.execute(`select paramvalue from parameters where paramname = 'lock_time'`, []);
        let fromReject = new Date(user[0].LockStartTime);
        let toReject = new Date(user[0].LockStartTime);
        toReject.setDate(fromReject.getDate() + locktime[0].paramvalue)

        if (toReject < new Date()) {
          await dbs.execute('update customer set CountReject = 0, LockStartTime = null where CustomerPhone = ?', [phone]);
          let rs = bcrypt.compareSync(password, user[0].CustomerPassword);

          if (rs) {
            delete user[0].CustomerPassword;
            let path = await dbs.execute('SELECT gp.path, gp.post, gp.get, gp.put, gp.del from group_permission gp, map_user_group mug, customer cu where gp.group_id=mug.group_id and mug.user_id= cu.CustomerID and cu.CustomerPhone =  ?', [phone]);
            var token = jwt.sign(JSON.parse(JSON.stringify(user[0])), config.secret, { expiresIn: config.expires });
            res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000), user: user[0], path: path });
          } else {
            res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
          }
        } else {
          let a = Math.ceil((toReject - new Date()) / (24 * 60 * 60 * 1000));
          res.json({ success: false, msg: 'Tài khoản của bạn bị khóa trong ' + a + ' ngày !' });
        }
      } else if(user[0].StatusID!==1){
        res.json({ success: false, msg: 'Tài khoản của bạn bị khóa vĩnh viễn !' });
      }
       else {
        let rs = bcrypt.compareSync(password, user[0].CustomerPassword);

        if (rs) {
          delete user[0].CustomerPassword;
          let path = await dbs.execute('SELECT gp.path, gp.post, gp.get, gp.put, gp.del from group_permission gp, map_user_group mug, customer cu where gp.group_id=mug.group_id and mug.user_id= cu.CustomerID and cu.CustomerPhone =  ?', [phone]);
          var token = jwt.sign(JSON.parse(JSON.stringify(user[0])), config.secret, { expiresIn: config.expires });
          res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000), user: user[0], path: path });
        } else {
          res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
        }
      }

    } else {

      res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
  }
});

router.post('/admin/signin', async function (req, res) {
  let mail = req.body.user.email;
  let password = req.body.user.password;

  try {
    let user = await dbs.execute('select * from admin where AdminEmail =?', [mail]);
    console.log(mail);

    if (user[0]) {
      let rs = bcrypt.compareSync(password, user[0].AdminPassword);
      if (rs) {
        delete user[0].AdminPassword;
        var token = jwt.sign(JSON.parse(JSON.stringify(user[0])), config.secret, { expiresIn: config.expires });
        res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000), user: user[0] });
      } else {
        res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
      }
    } else {
      res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
    }
  } catch (error) {
    res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
  }
});

router.post('/admin', [
  check('name', 'Name field is required').notEmpty(),
  check('mail', 'Email field is required').notEmpty(),
  check('mail', 'Email is not valid').isEmail(),
  check('pass', 'Password field is required').notEmpty(),
  check('pass', 'Password field is min 5 character').isLength({ min: 5 }),
  check('phone', 'Phone field is min 10 character').isLength({ min: 10 }),
  body('mail').custom(async value => {
    let user = await dbs.execute('select * from admin where AdminEmail = ?', [value])
    if (user[0]) {
      return Promise.reject('E-mail already in use');
    }
  }),
  body('phone').custom(async value => {
    let user = await dbs.execute('select * from admin where AdminPhone = ?', [value])
    if (user[0]) {
      return Promise.reject('Phone number already in use');
    }
  }),
  body('pass2').custom((value, { req }) => {
    if (value !== req.body.pass) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {

  try {
    // Check Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const saltRounds = 10;
      let salt = bcrypt.genSaltSync(saltRounds);
      let pass = bcrypt.hashSync(req.body.pass, salt);
      let sql = `insert into admin(AdminID, AdminName, AdminPassword, AdminPhone, AdminEmail) values(?, ?, ?, ?, ?)`;
      let adminID = await dbs.getNextID('admin', 'adminid');
      let bind = [adminID, req.body.name, pass, req.body.phone, req.body.mail];
      let rs = await dbs.execute(sql, bind);
      res.json(rs)
    }
  } catch (error) {
    //console.log(error);
    res.json({ err: 'error' });
  }

});

module.exports = router;
