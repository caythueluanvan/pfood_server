const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../utils/config');
const privateRoutePartner = require('./partnerprivate');
/* Add User */
router.post('/', [
    check('name', 'Name field is required').notEmpty(),
    check('mail', 'Email field is required').notEmpty(),
    check('mail', 'Email is not valid').isEmail(),
    check('username', 'Username field is required').notEmpty(),
    check('pass', 'Password field is required').notEmpty(),
    check('pass', 'Password field is min 5 character').isLength({ min: 5 }),
    check('phone', 'Password field is min 10 character').isLength({ min: 10 }),
    body('mail').custom(async value => {
        let user = await dbs.execute('select * from customer where CustomerEmail = ?', [value])
        if (user[0]) {
            return Promise.reject('E-mail already in use');
        }
    }),
    body('phone').custom(async value => {
        let user = await dbs.execute('select * from customer where CustomerPhone = ?', [value])
        if (user[0]) {
            return Promise.reject('Phone number already in use');
        }
    }),
    body('username').custom(async value => {
        let user = await dbs.execute('select * from customer where CustomerUsername = ?', [value])
        if (user[0]) {
            return Promise.reject('Username already in use');
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
            let sql = `insert into customer(CustomerID, CustomerName, CustomerUsername, CustomerPassword, 
                    CustomerAddress, CustomerPhone, CustomerEmail, StatusID) values(?, ?, ?, ?, ?, ?, ?, ?)`;
            let customerID = await dbs.getNextID('customer','customerid');        
            let bind = [customerID, req.body.name, req.body.username, pass, req.body.address, req.body.phone, req.body.mail, 1];
            let rs = await dbs.execute(sql, bind);
            res.json(rs)
        }
    } catch (error) {
        //console.log(error);
        res.json({ err: 'error' });
    }

});

// Sign in

router.post('/signin', async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
  
    try {
      let user = await dbs.execute('select * from customer, partner, city where CustomerUsername = ? and customer.CustomerID = partner.CustomerID and partner.cityID = city.cityID',[username]);    
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

privateRoutePartner(router);

module.exports = router;
