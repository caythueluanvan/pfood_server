const express = require('express');
const router = express.Router();
const dbs = require('../utils/dbs');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

/* Add User */
router.post('/', [
    check('name', 'Name field is required').notEmpty(),
    check('mail', 'Email field is required').notEmpty(),
    check('mail', 'Email is not valid').isEmail(),
    check('username', 'Username field is required').notEmpty(),
    check('pass', 'Password field is required').notEmpty(),
    check('pass', 'Password field is min 5 character').isLength({ min: 5 })
], async (req, res) => {

    try {
        // Check Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
        }

        const saltRounds = 10;
        let salt = bcrypt.genSaltSync(saltRounds);
        let pass = bcrypt.hashSync(req.body.pass, salt);
        let sql = `insert into customer(CustomerID, CustomerName, CustomerUsername, CustomerPassword, 
                CustomerAddress, CustomerPhone, CustomerEmail, StatusID) values(?, ?, ?, ?, ?, ?, ?, ?)`;
        let bind = ['A', req.body.name, req.body.username, pass, req.body.address, req.body.phone, req.body.mail, 1];
        let rs = await dbs.execute(sql, bind);
        res.json(rs)

    } catch (error) {
        console.log(error);
        res.json({ err: 'error' });
    }

});

/* Edit User */
router.put('/', (req, res) => {
    
});

module.exports = router;
