const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
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

/* Edit User */
router.put('/', [
    check('name', 'Name field is required').notEmpty(),
    check('mail', 'Email field is required').notEmpty(),
    check('mail', 'Email is not valid').isEmail(),
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
    })
], async (req, res) => {

    try {
        // Check Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {            
            res.status(422).json({ errors: errors.array() });
        } else {
            let sql = `update customer(CustomerName, 
                    CustomerAddress, CustomerPhone, CustomerEmail) values(?, ?, ?, ?) where CustomerID = ?`;
            let bind = [ req.body.name, req.body.address, req.body.phone, req.body.mail, req.body.customerID];
            let rs = await dbs.execute(sql, bind);
            res.json(rs)
        }
    } catch (error) {
        //console.log(error);
        res.json({ err: 'error' });
    }
});

/* Change Password User */
router.put('/repassword', [
    check('oldpass', 'Password field is required').notEmpty(),
    check('newpass', 'Password field is required').notEmpty(),
    check('newpass2', 'Password field is required').notEmpty(),
    check('newpass', 'New Password field is min 5 character').isLength({ min: 5 }),
    body('newpass2').custom((value, { req }) => {
        if (value !== req.body.newpass) {
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
            let sql = `update customer(CustomerPassword) values(?) where CustomerID = ?`;
            let bind = [ req.body.newpass, req.body.customerID];
            let rs = await dbs.execute(sql, bind);
            res.json(rs)
        }
    } catch (error) {
        //console.log(error);
        res.json({ err: 'error' });
    }
});

privateRouteUser(router);

module.exports = router;
