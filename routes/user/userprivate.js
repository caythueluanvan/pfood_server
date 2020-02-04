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

            jwt.verify(token, config.secret,async (err, decoded) => {
                if (err) return res.status(403).send({ msg: 'Hết phiên làm việc. Vui lòng đăng nhập lại!' });
                console.log(req.path);
                
                let per = await dbs.execute(`SELECT gp.* from group_permission gp, map_user_group mug
                where gp.group_id=mug.group_id and mug.user_id= ? and gp.path = ? and ?? = 1`, [decoded.CustomerID, req.path =='/'?'/user':`/user${req.path}`, req.method=='DELETE' ? 'del' : req.method]) 
                console.log(per);
                               
                if(!per[0]){
                    return res.status(403).send({ msg: 'Bạn không có quyền truy cập !' });
                }
                
                return next();
            })
        }
        catch (err) {
            next(err)
        }
    });
    
    /* Get All User */
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from customer');
        res.json(rs);
    });
};
