const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
/* Authentication */


module.exports = (router) => {
    //auth(router, '/seller');
    
    /* Get All Partner */
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from partner');
        res.json(rs);
    });

    /* Get Partner By Id*/
    router.get('/:id', async (req, res) => {
        let rs = await dbs.execute('select * from partner where id = ?',[req.params.id]);
        res.json(rs);
    });

     /* Put Partner By Id*/
     router.put('/', [
        check('partnerName', 'Name field is required').notEmpty(),
        check('partnerEmail', 'Email field is required').notEmpty(),
        check('partnerEmail', 'Email is not valid').isEmail(),
        check('partnerPhone', 'Password field is min 10 character').isLength({ min: 10 }),
        body('partnerEmail').custom(async value => {
            let user = await dbs.execute('select * from customer where CustomerEmail = ?', [value])
            if (user[0]) {
                return Promise.reject('E-mail already in use');
            }
        }),
        body('partnerPhone').custom(async value => {
            let user = await dbs.execute('select * from customer where CustomerPhone = ?', [value])
            if (user[0]) {
                return Promise.reject('Phone number already in use');
            }
        }),
    ], async (req, res) => {
        try {
            // Check Errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {            
                res.status(422).json({ errors: errors.array() });
            } else {
                let sql = `update partner(PartnerName, PartnerAddress, PartnerEmail, PartnerPhone, PartnerDescription,
                    PartnerImage, PartnerTypeID, CityID, StatusID) values(?, ?, ?, ?, ?, ?, ?, ?, ?) where PartnerID = ?`;
                let bind = [ req.body.partnerName, req.body.partnerAddress, partnerEmail, req.body.partnerPhone, req.body.partnerDescription, req.body.partnerImage, req.body.partnerTypeID, req.body.cityID, req.body.statusID, req.body.partnerID];
                let rs = await dbs.execute(sql, bind);
                res.json(rs)
            }
        } catch (error) {
            //console.log(error);
            res.json({ err: 'error' });
        }
    });

    /* Delete Partner By Id*/
    router.delete('/:id', async (req, res) => {
        let rs = await dbs.execute('Delete from partner where id = ?',[req.params.id]);
        res.json(rs);
    });

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
};
