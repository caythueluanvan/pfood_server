const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../utils/config');
const privateRoutePartner = require('./partnerprivate');
/* Add User */
router.post('/', [
    // check('username', 'Tên đăng nhập không được để trống !').notEmpty(),
    check('phone', 'Dộ dài số điện thoại không hợp lệ !').isLength({ min: 10 }),
    body('email').custom(async value => {
        let user = await dbs.execute('select * from partner where partneremail = ?', [value])
        if (user[0]) {
            return Promise.reject('Địa chỉ email đã tồn tại !');
        }
    }),
    body('phone').custom(async value => {
        let user = await dbs.execute('select * from partner where partnerphone = ?', [value])
        if (user[0]) {
            return Promise.reject('Số dt đã tồn tại !');
        }
    }),
    // body('username').custom(async value => {
    //     let user = await dbs.execute('select * from customer c, partner p where c.customerid = p.customerid and customerusername = ?', [value])
    //     if (user[0]) {
    //         return Promise.reject('Tài khoản đối tác của bạn đã tồn tại!');
    //     }
    // }),
    // body('username').custom(async (value, { req }) => {
    //     let user = await dbs.execute('select * from customer where customerusername = ?', [value])
    //     if (user[0]) { 
    //         return true;
    //     }
    //     return Promise.reject('Tài khoản khách hàng của bạn chưa tồn tại!');
    // }),
    body('name').custom(async value => {
        let user = await dbs.execute('select * from partner where partnername = ?', [value])
        if (user[0]) {
            return Promise.reject('Tên đối tác của bạn đã tồn tại!');
        }
    })
], async (req, res) => {

    try {
        // Check Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            
            res.status(200).json({ errors: errors.array() });
        } else {
            // let customer_id = await dbs.execute(`select customerid from customer where customerusername = ?`, [req.body.username]);
            let sql = `insert into partner(partnerid, partnername, partneraddress, partneremail, partnerphone, partnerdescription, cityid, statusid, ship) values( ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            let partner_id = await dbs.getNextID('partner', 'partnerid');
            let bind = [partner_id, req.body.name, req.body.address, req.body.email, req.body.phone, req.body.description, req.body.city, 0, req.body.ship];
            let rs = await dbs.execute(sql, bind);
            res.json(rs)
        }
    } catch (error) {
        res.json({ err: error });
    }

});

// Sign in

router.post('/signin', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    try {
        let user = await dbs.execute('select customer.*, partner.PartnerID, partner.PartnerName, partner.PartnerAddress, partner.PartnerEmail, partner.PartnerPassword, partner.PartnerPhone, partner.PartnerDescription, partner.PartnerImage, partner.PartnerTypeID, partner.ship, partner.statusid PartnerStatus, city.* from customer, partner, city where partner.PartnerEmail = ? and customer.CustomerID = partner.CustomerID and partner.cityID = city.cityID', [email]);
        
        if (user[0]) {
            let rs = bcrypt.compareSync(password, user[0].PartnerPassword);            
            if(user[0].PartnerStatus !== 1){
                res.json({ success: false, msg: 'Tài khoản của bạn đang bị khóa hoặc chưa kích hoạt !' });
            } else if (rs) {                                
                delete user[0].CustomerPassword;
                delete user[0].PartnerPassword;
                let path = await dbs.execute('SELECT gp.path, gp.post, gp.get, gp.put, gp.del from group_permission gp, map_user_group mug, customer cu where gp.group_id=mug.group_id and mug.user_id= cu.CustomerID and cu.CustomerUsername =  ?', [user[0].CustomerUsername]);
                var token = jwt.sign(JSON.parse(JSON.stringify(user[0])), config.secret, { expiresIn: config.expires });
                res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000), user: user[0], path: path });
                
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

privateRoutePartner(router);

module.exports = router;
