const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
var uniqid = require('uniqid');
/* Authentication */


module.exports = (router) => {
    // Xác thực
    // router.use(async (req, res, next) => {
        
    //     try {
    //         let header = req.headers && req.headers.authorization, matches = header ? /^Bearer (\S+)$/.exec(header) : null, token = matches && matches[1];     
    //         if (!token) return res.status(403).send({ msg: 'Xác thực không thành công. Vui lòng đăng nhập lại!' });

    //         jwt.verify(token, config.secret,async (err, decoded) => {
    //             if (err) return res.status(403).send({ msg: 'Hết phiên làm việc. Vui lòng đăng nhập lại!' });
                
    //             let per = await dbs.execute(`SELECT gp.* from group_permission gp, map_user_group mug
    //             where gp.group_id=mug.group_id and mug.user_id= ? and gp.path = ? and ?? = 1`, [decoded.CustomerID, req.path =='/'?'/user':`/user${req.path}`, req.method=='DELETE' ? 'del' : req.method]) 
                               
    //             if(!per[0]){
    //                 return res.status(403).send({ msg: 'Bạn không có quyền truy cập !' });
    //             }
                
    //             return next();
    //         })
    //     }
    //     catch (err) {
    //         next(err)
    //     }
    // });
    auth(router, '/user');
    
    /* Get All User */
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from customer');
        res.json(rs);
    });

    router.get('/products/:city/:shop/:type/:catalog/:limit/:offset', async (req, res) => {
        let sql = 'select i.ItemName, s.* from sourceofitems s, items i, partner p  where s.ItemID = i.ItemID and i.PartnerID = p.PartnerID  and s.EndTime >= now() and s.StartTime <= now() and p.statusID = 1 and i.StatusID = 1'
        
        if(req.params.city != 'all'){
            sql = sql + ' and p.CItyID = ' + req.params.city
        }
        if(req.params.shop != 'all'){
            sql = sql + ' and i.PartnerID = ' + req.params.shop
        }

        if(req.params.catalog != 'all'){
            sql = sql + ' and p.PartnerTypeID = ' + req.params.catalog
        }

        if(req.params.type != 'all'){
            if(req.params.type == 'MostView'){

                sql = sql + ' order by s.view desc'
            }
            else if(req.params.type = 'Latest'){
                sql = sql + '  order by s.StartTime desc'
            }
        }
        sql = sql + ' limit ' + req.params.limit + ' offset ' + req.params.offset;

        console.log(sql)
        let rs = await dbs.execute(sql);
        res.json(rs)
    });

    
    router.get('/products/:SourceOfItemsID', async (req, res) => {
        sql = 'select i.ItemName, s.*, p.* from sourceofitems s, items i, partner p  where s.ItemID = i.ItemID and i.PartnerID = p.PartnerID and s.SourceOfItemsID = "' + req.params.SourceOfItemsID + '"'
        sqlStartOfPartner = 'select avg(rate) as star, sum(likes) as likes from rate where SourceOfItemsID = "' + req.params.SourceOfItemsID + '"'
        console.log(sqlStartOfPartner)
        let rs = await dbs.execute(sql);
        let rs2 = await dbs.execute(sqlStartOfPartner);
        console.log(rs2[0])
        rs[0].star = rs2[0].star
        rs[0].like = rs2[0].likes
        res.json(rs[0])
    });

    router.post('/follow', async (req, res) => {
        let sql = 'select count(*) as checks from follow where PartnerID = "' + req.body.PartnerID + '" and CustomerID = "' + req.body.CustomerID +'"'
        let rs = await dbs.execute(sql);
        let sql2
        if(rs[0].checks > 0){
             sql2 = 'delete from follow where PartnerID = "' + req.body.PartnerID + '" and CustomerID = "' + req.body.CustomerID +'"'
        }
        else{
             sql2 = 'INSERT INTO follow (CustomerID, PartnerID) VALUES ( "'  + req.body.CustomerID + '", "' + req.body.PartnerID +'")'
        }

        let rs2 = await dbs.execute(sql2);
        let result = {status: true,message:"Thành công"};
        if(rs2.affectedRows = 0){
            result.status = false 
            result.message = rs2.message
        }
        res.json(result)
    });


    router.post('/view', async (req, res) => {
        let sql = 'UPDATE sourceofitems SET view = view+1 WHERE SourceOfItemsID = "' + req.body.SourceOfItemsID + '"'
        let rs = await dbs.execute(sql);
        let result = {status: true,message:"Thành công"};
        if(rs.affectedRows = 0){
            result.status = false 
            result.message = rs.message
        }
        res.json(result)
    });

    router.post('/order', async (req, res) => {
        let result = {status: true,message:"Thành công"};
        let id = uniqid();
        let sql = 'INSERT INTO `order`(OrderID, CustomerID, OrderNote, OrderPayment, StatusID) VALUES ("'+ id +'", "'+ req.body.CustomerID +'", "' + req.body.OrderNote + '", "' + req.body.OrderPayment + '", 1)'
        console.log(sql)
        let rs = await dbs.execute(sql);
        if(rs.affectedRows > 0){
            let orderDetail = req.body.orderDetail
            
            orderDetail.map((o) => {
                let sql2 = 'INSERT INTO orderdetail(OrderID, SourceOfItemsID, Total, Price, Ship, Description) VALUES ("' + id +'", "'+ o.SourceOfItemsID +'", "'+ o.Total +'", "'+ o.Price +'", "'+ o.Ship +'", "'+ o.Description +'")'
                console.log(sql2)
                let rs2 = dbs.execute(sql2);
                if(rs2.affectedRows = 0){
                    result.status = false 
                    result.message = rs2.message
                }
            })
        }
        else{
            result.status = false 
            result.message = rs.message
        }
        
        res.json(result)
    });
};
