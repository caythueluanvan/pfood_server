const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const privateRouteUser = require('./userprivate');

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
            return Promise.reject('E-mail đã tồn tại');
        }
    }),
    body('phone').custom(async value => {
        let user = await dbs.execute('select * from customer where CustomerPhone = ?', [value])
        if (user[0]) {
            return Promise.reject('Sdt đã tồn tại');
        }
    }),
    body('username').custom(async value => {
        let user = await dbs.execute('select * from customer where CustomerUsername = ?', [value])
        if (user[0]) {
            return Promise.reject('Tài khoản đã tồn tại');
        }
    }),
    body('pass2').custom((value, { req }) => {
        if (value !== req.body.pass) {
            throw new Error('Mật khẩu nhập lại không khớp');
        }
        return true;
    })  
], async (req, res) => {

    try {
        // Check Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {            
            res.json({ errors: errors.array() });
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
        console.log(error);
        res.json({ err: 'error' });
    }

});

/* Check phone */
router.get('/checkphonenumber/:phone', async (req, res) => {
    try {
       let rs = await dbs.execute(`select * from customer where customerphone = ?`,[req.params.phone])
        if (rs.length) {
            res.json({ status: '1', msg: 'Số điện thoại đã tồn tại !' });
        } else {
            res.json({ status: '0', msg: 'Số điện thoại chưa tồn tại !' });
        }
    } catch (error) {
        console.log(error);
        res.json({ status: '2', msg: error });
    }
});

privateRouteUser(router);

module.exports = router;
