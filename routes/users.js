var express = require('express');
var router = express.Router();
const dbs = require('../utils/dbs');
const { check, validationResult } = require('express-validator');

/* Authentication */

/* Get All User */
router.get('/data', async (req, res) => {
    let rs = await dbs.execute('select * from customer');
    res.json(rs);
});

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
        let sql = `insert into customer(CustomerID, CustomerName, CustomerUsername, CustomerPassword, 
                CustomerAddress, CustomerPhone, CustomerEmail, StatusID) values(?, ?, ?, ?, ?, ?, ?, ?)`;
        let bind = ['A', req.body.name, req.body.username, req.body.pass, req.body.address, req.body.phone, req.body.mail, 1];
        let rs =await dbs.execute(sql, bind);
        res.json(rs)

    } catch (error) {
        console.log(error);
        res.json({ err: 'error' });
    }

});

/* Edit User */
router.put('/', (req, res) => {
});

/* Delete User */
router.delete('/', (req, res) => {
});

module.exports = router;
