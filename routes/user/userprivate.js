const dbs = require('../../utils/dbs');
const jwt = require('jsonwebtoken');
const config = require('../../utils/config');
/* Authentication */


module.exports = (router) => {
    // Xác thực
    router.use(async (req, res, next) => {
        
        try {
            let header = req.headers && req.headers.authorization, matches = header ? /^Bearer (\S+)$/.exec(header) : null, token = matches && matches[1];     
            if (!token) return res.status(403).send({ msg: 'Xác thực không thành công. Vui lòng đăng nhập lại!' });

            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) return res.status(403).send({ msg: 'Hết phiên làm việc. Vui lòng đăng nhập lại!' });
                console.log(decoded);
                

                return next();
            })
        }
        catch (err) {
            next(err)
        }
    });

    // Check phân quyền
    router.use(async (req, res, next) => {
        console.log(req.next);
        
        try {
            console.log(req.path);
            console.log(req.method);
            return next();
        }
        catch (err) {
            next(err)
        }
    });
    
    /* Get All User */
    router.get('/data', async (req, res) => {
        let rs = await dbs.execute('select * from customer');
        res.json(rs);
    });
};
