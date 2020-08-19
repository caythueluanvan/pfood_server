const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
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
    // auth(router, '/user');
    
    /* Get All User */
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from customer');
        res.json(rs);
    });

    router.get('/history/:customer_id', async (req, res) => {
        let sql = 'select x.* from (select o.OrderID,"6","Chờ lấy hàng",o.addDate CreateDate, o.ship, o.shipAddress, o.OrderNote,o.OrderPayment, o.PartnerID, p.PartnerName, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname from `order` o, status s, partner p where p.PartnerID = o.PartnerID and s.StatusID = o.StatusID and o.customerID = "'+req.params.customer_id+'" and o.addDate is not null  union all select o.OrderID,"3","Hủy",o.rejectDate CreateDate, o.ship, o.shipAddress, o.OrderNote,o.OrderPayment, o.PartnerID, p.PartnerName, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname from `order` o, status s, partner p where p.PartnerID = o.PartnerID and s.StatusID = o.StatusID and o.customerID = "'+req.params.customer_id+'" and o.rejectDate is not null union all select o.OrderID,4,"Hoàn thành",o.approveDate CreateDate, o.ship, o.shipAddress, o.OrderNote,o.OrderPayment, o.PartnerID, p.PartnerName, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname from `order` o, status s, partner p where p.PartnerID = o.PartnerID and s.StatusID = o.StatusID and o.customerID = "'+req.params.customer_id+'" and o.approveDate is not null)x order by x.CreateDate desc'
        // sql = 'select x.* from (select o.OrderID,o.StatusID,s.StatusName,o.addDate CreateDate, o.ship, o.shipAddress, o.OrderNote,o.OrderPayment, o.PartnerID, p.PartnerName, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname from `order` o, status s, partner p where p.PartnerID = o.PartnerID and s.StatusID = o.StatusID and o.customerID = "'+req.params.customer_id+'" and o.addDate is not null union all select o.OrderID,o.StatusID,s.StatusName,o.addDate CreateDate, o.ship, o.shipAddress, o.OrderNote,o.OrderPayment, o.PartnerID, p.PartnerName, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname from `order` o, status s, partner p where p.PartnerID = o.PartnerID and s.StatusID = o.StatusID and o.customerID = "'+req.params.customer_id+'" and o.rejectDate is not null union all select o.OrderID,o.StatusID,s.StatusName,o.addDate CreateDate, o.ship, o.shipAddress, o.OrderNote,o.OrderPayment, o.PartnerID, p.PartnerName, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname from `order` o, status s, partner p where p.PartnerID = o.PartnerID and s.StatusID = o.StatusID and o.customerID = "'+req.params.customer_id+'" and o.approveDate is not null)x order by x.CreateDate desc '
        console.log(sql)
        let rs = await dbs.execute(sql)
        res.json(rs);
    });

    /* Change Pass */
    router.post('/changepass', [
        check('oldPass', 'Tên không được để trống !').notEmpty(),
        check('newPass', 'Tên không được để trống !').notEmpty(),
        check('rePass', 'Tên không được để trống !').notEmpty(),
        check('newPass', 'Độ dài mật khẩu mới tối thiểu 5 ký tự !').isLength({ min: 5 }),
        body().custom(async value => {
            let user = await dbs.execute('select * from customer where customerid = ?', [value.id])            
            let rs = bcrypt.compareSync(value.oldPass, user[0].CustomerPassword);
            if (!rs) {
                return Promise.reject('Mật khẩu cũ không chính xác !');
            }
        }),
        body().custom(async value => {
            if (value.newPass !== value.rePass) {
                return Promise.reject('Mật khẩu nhắc lại không khớp !');
            }
        }),
    ], async (req, res) => {
        try {
            // Check Errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let msg = errors.array().map((e, i) => {
                    return e.msg + ''
                })
                res.json({ type: 'fail', msg: msg });
            } else {
                const saltRounds = 10;
                let salt = bcrypt.genSaltSync(saltRounds);
                let pass = bcrypt.hashSync(req.body.newPass, salt);
                let sql = `update customer set CustomerPassword =? where customerid=?`;
                let bind = [pass, req.body.id];
                let rs = await dbs.execute(sql, bind);
                if (rs.affectedRows > 0) {
                    res.json({ type: 'success', msg: 'Sửa thành công !' });
                } else {
                    res.json({ type: 'fail', msg: 'Sửa không thành công !' });
                }
            }
        } catch (error) {
            console.log(error);
            res.json({ type: 'fail', msg: error });
        }
    });

    router.get('/historyDetail/:order_id', async (req, res) => {

        // let sql = 'select i.ItemName, c.total, c.price, s.SourceOfItemsID, s.ItemID, i.ItemImage as Image, i.description as Description, (select prm.Promotiontypeid from promotion prm where prm.ItemID = i.ItemID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.ItemID = i.ItemID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotiontypeid from promotion prm where prm.ItemID = i.ItemID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.ItemID = i.ItemID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname   from `order` o, orderdetail c, sourceofitems s, items i, partner p  where o.orderid = c.orderid and c.SourceOfItemsID = s.SourceOfItemsID and o.orderid = "'+req.params.order_id+'" and s.ItemID = i.ItemID and i.PartnerID = p.PartnerID'
        // let rs1 = await dbs.execute(sql);
        // let sql2 = 'select *, (select statusID from `order` where orderid = "' + req.params.order_id + '") order_status from partner  where PartnerID in (select distinct p.PartnerID from `order` o, orderdetail c, sourceofitems s, items i, partner p  where o.orderid = c.orderid and c.SourceOfItemsID = s.SourceOfItemsID and o.orderid = "'+req.params.order_id+'" and s.ItemID = i.ItemID and i.PartnerID = p.PartnerID)'

        let sql = 'select it.ItemName, c.total, s.price, s.SourceOfItemsID, s.ItemID, i.ItemImage as Image, i.defaultprice, i.description as Description, (select prm.Promotiontypeid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as typename, (select prm.Promotionconditionid from promotion prm where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate) as conditionname  from `order` o, orderdetail c, sourceofitems s, itempartner i, items it, partner p  where o.orderid = c.orderid and c.SourceOfItemsID = s.SourceOfItemsID and o.orderid = "'+req.params.order_id+'" and s.ItemID = i.id and i.itemid = it.itemid and i.PartnerID = p.PartnerID'
        // console.log(sql)
        let rs1 = await dbs.execute(sql);
        let sql2 = 'select * , (select statusID from `order` where orderid = "' + req.params.order_id + '") order_status, (select prm.Promotiontypeid from promotion prm, `order` o where prm.PromotionID = o.PromotionID and prm.StartTime <= o.adddate and prm.EndTime >= o.adddate and o.orderid = "'+req.params.order_id+'") as typeid, (select prm.Promotionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as promotionid, (select prm.Promotiontypeid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typename, (select prm.Promotionconditionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionname from partner p  where PartnerID in (select distinct p.PartnerID from `order` o, orderdetail c, sourceofitems s, itempartner i, partner p  where o.orderid = c.orderid and c.SourceOfItemsID = s.SourceOfItemsID and o.orderid = "'+req.params.order_id+'" and s.ItemID = i.id and i.PartnerID = p.PartnerID) '
        console.log(sql2)
        let rs2 = await dbs.execute(sql2);
        let rs = {}
        rs.Partner = rs2[0]
        rs.ListItems = rs1
        res.json(rs)
    });

    router.get('/reject/:order_id', async (req, res) => {
        let sql2 = 'update customer set CountReject  = CountReject + 1 where CustomerID in (select CustomerID from `order` where orderid = "'+req.params.order_id+'")'
        let rs2= await dbs.execute(sql2);
        let msg = 'Khách hàng hủy đơn !';
        let sql = 'update `order` set statusID = 3, rejectDate = now(),note= "'+msg+'" where orderid = "'+req.params.order_id+'"'
        // console.log(sql)
        let rs= await dbs.execute(sql);
        if(rs.changedRows > 0){
            let sql100 ='select * from parameters where ParamID = 4'
            let rs100 = await dbs.execute(sql100);
            let sql6 = 'select * from orderdetail where OrderID = "' + req.params.order_id + '"'
            let rs6 = await dbs.execute(sql6);
            // console.log(rs6)
            rs6.forEach(o => {
                let sql7 = 'update sourceofitems set Summary = Summary + ' + o.Total + ' where SourceOfItemsID = "' + o.SourceOfItemsID + '"'
                let rs7 = dbs.execute(sql7);
            })
            let sql3 = 'select CountReject from customer where CustomerID in (select CustomerID from `order` where orderid = "'+req.params.order_id+'")'
            let rs3= await dbs.execute(sql3);
            if(rs3[0].CountReject == rs100[0].ParamValue){
                let sql2 = 'update customer set LockStartTime  = now() where CustomerID in (select CustomerID from `order` where orderid = "'+req.params.order_id+'")'
                dbs.execute(sql2);
                res.json({status:true, message: "huy thanh cong"})
            }else{
                res.json({status:true, message: "huy thanh cong"})
            }
        }
        else{
            res.json({status:false, message: "huy khong thanh cong"})
        }
        
    });

    router.get('/banner', async (req, res) => {
        let rs = await dbs.execute('select ParamValue from config where ParamName = "Banner"');
        // console.log(rs)

        let arrResult = [];
        rs.map((r) => {
            arrResult.push(r.ParamValue)
        })
        res.json(arrResult);
    });

    router.get('/products/:city/:shop/:type/:catalog/:limit/:offset', async (req, res) => {
        let sql = 'select it.ItemName, s.SourceOfItemsID, s.ItemID, s.Summary, i.ItemImage as Image, i.defaultprice, i.description as Description, s.Price, s.StartTime, s.EndTime, s.FeeID, s.view, (select prm.Promotiontypeid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typename, (select prm.Promotionconditionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionname from sourceofitems s, itempartner i,items it, partner p  where it.itemid = i.itemid and s.ItemID = i.id and i.PartnerID = p.PartnerID  and s.EndTime >= now() and p.statusID = 1 and i.StatusID = 1 and s.Summary >0'
        
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

    router.post('/products/search', async (req, res) => {
        sql = 'select it.ItemName, s.SourceOfItemsID, s.ItemID, s.Summary, i.ItemImage as Image, i.defaultprice, i.description as Description, s.Price, s.StartTime, s.EndTime, s.FeeID, s.view, (select prm.Promotiontypeid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typename, (select prm.Promotionconditionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionname from sourceofitems s, items it, itempartner i, partner p  where s.ItemID = i.id and i.itemid = it.itemid and i.PartnerID = p.PartnerID  and s.EndTime >= now() and p.statusID = 1 and i.StatusID = 1 and (p.PartnerName like "%'+req.body.SearchText+'%" or it.ItemName like "%' +req.body.SearchText+ '%") and p.CItyID = "' +req.body.CityID+ '" and s.Summary >0'
        let rs = await dbs.execute(sql);  
        res.json(rs)
    });

    
    router.get('/products/:SourceOfItemsID', async (req, res) => {
        sql = 'select it.ItemName, s.SourceOfItemsID, s.ItemID, s.Summary, i.ItemImage as Image, i.defaultprice, i.description as Description, s.Price, s.StartTime, s.EndTime, s.FeeID, s.view, p.*, (select prm.Promotiontypeid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typeid,(select prm.Promotionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as promotionid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typename, (select prm.Promotionconditionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionname from sourceofitems s, items it,itempartner i, partner p  where s.ItemID = i.id and i.itemid = it.itemid and i.PartnerID = p.PartnerID and s.SourceOfItemsID = "' + req.params.SourceOfItemsID + '"'
        sqlStartOfPartner = 'select avg(rate) as star, sum(likes) as likes from rate where SourceOfItemsID = "' + req.params.SourceOfItemsID + '"'
        sqlListRate = 'SELECT c.CustomerName, c.CustomerUsername, r.rate, r.Comment, r.CreateDate FROM rate r, sourceofitems s, customer c WHERE r.SourceOfItemsID = s.SourceOfItemsID and c.CustomerID = r.CustomerID and s.ItemID in (select DISTINCT ItemID from sourceofitems WHERE SourceOfItemsID ="'+req.params.SourceOfItemsID+'") order by CreateDate desc limit 3'
        //console.log(sqlListRate)
		let rs3 = await dbs.execute(sqlListRate);
        let rs = await dbs.execute(sql);
        let rs2 = await dbs.execute(sqlStartOfPartner);
        
        rs[0].star = await rs2[0].star
        rs[0].like = await rs2[0].likes
        rs[0].rate = await rs3
        //console.log(rs[0])
        res.json(rs[0])
    });

    router.get('/products/ratedetail/:SourceOfItemsID/:limit/:offset', async (req, res) => {
        sqlListRate = 'SELECT c.CustomerName, c.CustomerUsername, r.rate, r.Comment, r.CreateDate FROM rate r, sourceofitems s, customer c WHERE r.SourceOfItemsID = s.SourceOfItemsID and c.CustomerID = r.CustomerID and s.ItemID in (select DISTINCT ItemID from sourceofitems WHERE SourceOfItemsID ="'+req.params.SourceOfItemsID+'") order by CreateDate desc  limit ' + req.params.limit + ' offset ' + req.params.offset

        let rs3 = await dbs.execute(sqlListRate);

        res.json(rs3)
    });

    router.get('/products/qnadetail/:SourceOfItemsID/:limit/:offset', async (req, res) => {
        let result =await []
        sqlListRate = 'SELECT r.ID , c.CustomerName, c.CustomerUsername, r.question, r.CreateDate FROM qna r, sourceofitems s, customer c WHERE r.SourceOfItemsID = s.SourceOfItemsID and c.CustomerID = r.CustomerID and s.ItemID in (select DISTINCT ItemID from sourceofitems WHERE SourceOfItemsID ="'+req.params.SourceOfItemsID+'") order by CreateDate desc  limit ' + req.params.limit + ' offset ' + req.params.offset
        // console.log(sqlListRate)
        let rs3 = await dbs.execute(sqlListRate);
        
        const promises = rs3.map(async a => {
            let sqlListTL = 'select r.ID , c.CustomerName, c.CustomerUsername, r.anser, r.CreateDate from qnaDetail r, customer c where c.CustomerID = r.CustomerID and qnaid = "' + a.ID + '"'
            let rs4 = await dbs.execute(sqlListTL);
            
            return {
                cauhoi: a,
                traloi:rs4
            }
        })
        res.json(await Promise.all(promises))
    });

    router.post('/products/isRate', async (req, res) => {
        sqlisRate = 'SELECT count(*) as tong from orderdetail d, `order` o, sourceofitems s where o.OrderID = d.OrderID and o.customerID = "'+req.body.CustomerID+'" and s.SourceOfItemsID = d.SourceOfItemsID and s.ItemID in (select DISTINCT ItemID from sourceofitems WHERE SourceOfItemsID ="'+req.body.SourceOfItemsID+'")'
        // console.log(sqlisRate)
        let result = false
        let rs = await dbs.execute(sqlisRate);
        if(rs[0].tong > 0){
            result = true
        }
        res.json(result)
    });

    router.post('/products/createRate', async (req, res) => {
        let id = uniqid();
        let result = {status: true,message:"Thành công"};
        sqlisRate = 'INSERT INTO rate(CustomerID, SourceOfItemsID, Rate, Comment, RateID, CreateDate) VALUES ("'+req.body.CustomerID+'","'+req.body.SourceOfItemsID+'","'+req.body.Rate+'","'+req.body.Comment+'","'+id+'",+now())'
        let rs = await dbs.execute(sqlisRate);
        if(rs.affectedRows = 0){
            result.status = false 
            result.message = rs.message
        }
        res.json(result)
    });

    router.post('/products/createqna', async (req, res) => {
        let id = uniqid();
        let result = {status: true,message:"Thành công"};
        sqlisRate = 'INSERT INTO qna(CustomerID, SourceOfItemsID, question, ID, CreateDate) VALUES ("'+req.body.CustomerID+'","'+req.body.SourceOfItemsID+'","'+req.body.question+'","'+id+'",now())'
        let rs = await dbs.execute(sqlisRate);
        if(rs.affectedRows = 0){
            result.status = false 
            result.message = rs.message
        }
        res.json(result)
    });

    router.post('/products/createqnadetail', async (req, res) => {
        let id = uniqid();
        let result = {status: true,message:"Thành công"};
        sqlisRate = 'INSERT INTO qnadetail(CustomerID, anser, ID, CreateDate, QnAID) VALUES ("'+req.body.CustomerID+'","'+req.body.anser+'","'+id+'",now(), "' + req.body.QnAID +'")'
        let rs = await dbs.execute(sqlisRate);
        if(rs.affectedRows = 0){
            result.status = false 
            result.message = rs.message
        }
        res.json(result)
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
		
        let id =""
        let rsCheck = 1
        do{
        //sinh 5 ký tự từ các số và ký tự từ a- z
        id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        let sqlCheck = 'select count(OrderID) dem from `order` where upper(OrderID) = upper("'+id+'")'
        //kiểm tra dưới db xem đã tồn tại mã này chưa
        rsCheck = await dbs.execute(sqlCheck)
        }while(rsCheck[0].dem > 0)
        let result = {status: true,message:id };
        let sql = 'INSERT INTO `order`(OrderID, CustomerID, OrderNote, OrderPayment,ship, shipAddress, StatusID, PartnerID, promotionid) VALUES ("'+ id +'", "'+ req.body.CustomerID +'", "' + req.body.OrderNote + '", "' + req.body.OrderPayment + '", "' + req.body.ship + '", "' + req.body.shipAddress + '", 6, "'+ req.body.PartnerID +'", "'+ req.body.promotionid +'")'
        let rs = await dbs.execute(sql);
        if(rs.affectedRows > 0){
            let orderDetail = req.body.orderDetail
            orderDetail.map((o) => {

                let sql2 = 'INSERT INTO orderdetail(OrderID, SourceOfItemsID, Total, Price, Ship, Description) VALUES ("' + id +'", "'+ o.SourceOfItemsID +'", "'+ o.Total +'", "'+ o.Price +'", "'+ o.Ship +'", "'+ o.Description +'")'
                // console.log(sql2)
                let rs2 = dbs.execute(sql2);

                let sql7 = 'update sourceofitems set Summary = Summary - ' + o.Total + ' where SourceOfItemsID = "' + o.SourceOfItemsID + '"'
                // console.log(sql7)
                let rs7 = dbs.execute(sql7);

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

    router.post('/product/addToCart', async (req, res) => {
        // console.log(req.body)
        let result = {status: true,message:"Thành công"};

        let sql = 'select count(*) as tong from cart where CustomerID = "'+req.body.CustomerID+'" and SourceOfItemsID = "' + req.body.SourceOfItemsID + '"'
        let rs = await dbs.execute(sql);
        let sql2 = 'select count(*) as tong from cart where CustomerID = "'+req.body.CustomerID+'"'
        let rs2 = await dbs.execute(sql2);
        if(rs[0].tong > 0){
            let sql1= 'update cart set amount = amount + ' + req.body.amount + ' where CustomerID = "'+req.body.CustomerID+'" and SourceOfItemsID = "' + req.body.SourceOfItemsID + '"'
            let rs1 = await dbs.execute(sql1);
            if(rs1.affectedRows = 0){
                result.status = false 
                result.message = rs1.message
                res.json(result)
            }else{
                res.json(result)
            }
        }
        else if (rs2[0].tong == 0){
            let sql3= 'INSERT INTO cart(SourceOfItemsID, CustomerID, PartnerID, amount) VALUES ("'+req.body.SourceOfItemsID+'", "'+req.body.CustomerID+'", "'+ req.body.PartnerID+'", "'+req.body.amount+'")'
            let rs3 = await dbs.execute(sql3);
            if(rs3.affectedRows == 0){
                result.status = false 
                result.message = rs3.message
                res.json(result)
            }else{
                res.json(result)
            }
        }
        else {
            let sql4 = 'select case when "'+ req.body.PartnerID +'" in (select distinct PartnerID from cart where CustomerID = "'+req.body.CustomerID+'") then 1 else 0 end tong from dual'
            let rs4 = await dbs.execute(sql4);
            if(rs4[0].tong == 1){
                let sql5= 'INSERT INTO cart(SourceOfItemsID, CustomerID, PartnerID, amount) VALUES ("'+req.body.SourceOfItemsID+'", "'+req.body.CustomerID+'", "'+ req.body.PartnerID+'", "'+req.body.amount+'")'
                let rs5 = await dbs.execute(sql5);
                if(rs5.affectedRows = 0){
                    result.status = false 
                    result.message = rs5.message
                    res.json(result)
                }else{
                    res.json(result)
                }
            }
            else{
                res.json({status:false, message: 'repeate'})
            }
        }

       
    });

    router.post('/product/minusToCart', async (req, res) => {
        let result = {status: true,message:"Thành công"};
        let sql = 'select *  from cart where CustomerID = "'+req.body.CustomerID+'" and SourceOfItemsID = "' + req.body.SourceOfItemsID + '"'
        let rs = await dbs.execute(sql)
        if(rs.length > 0){
            if(rs[0].amount > req.body.amount){
                sql1= 'update cart set amount = amount - ' + req.body.amount + ' where CustomerID = "'+req.body.CustomerID+'" and SourceOfItemsID = "' + req.body.SourceOfItemsID + '"'
            }
            else{
                sql1 = 'delete from cart where CustomerID = "'+req.body.CustomerID+'" and SourceOfItemsID = "' + req.body.SourceOfItemsID + '"'
            }
            let rs1 = await dbs.execute(sql1)
            if(rs1.affectedRows = 0){
                result.status = false 
                result.message = rs1.message
            }
            
        }
        else{
            result.status = false 
            result.message = rs1.message
        }

        res.json(result)
        
    });

    router.get('/cart/:CustomerID', async (req, res) => {
        
        let sql = 'select it.ItemName, c.amount, s.SourceOfItemsID, s.ItemID, s.Summary, i.ItemImage as Image, i.defaultprice, i.description as Description, s.Price, s.StartTime, s.EndTime, s.FeeID, s.view from cart c, sourceofitems s, items it, itempartner i,  partner p  where c.SourceOfItemsID = s.SourceOfItemsID and c.CustomerID = "'+req.params.CustomerID+'" and s.ItemID = i.id and i.itemid = it.itemid and i.PartnerID = p.PartnerID  and s.EndTime >= now() and s.StartTime <= now() and p.statusID = 1 and i.StatusID = 1 '
        let rs2 = await dbs.execute(sql);
        if(rs2.length > 0){
        let sql1 = 'select p.*,(select prm.Promotionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as promotionid, (select prm.Promotiontypeid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typename, (select prm.Promotionconditionid from promotion prm where prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.partnerID = p.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionname from partner p  where p.PartnerID in (select distinct p.PartnerID from cart c, sourceofitems s, itempartner i, partner p  where c.SourceOfItemsID = s.SourceOfItemsID and c.CustomerID = "'+req.params.CustomerID+'" and s.ItemID = i.id and i.PartnerID = p.PartnerID and s.EndTime >= now() and s.StartTime <= now() and p.statusID = 1 and i.StatusID = 1 )'
        let rs1 = await dbs.execute(sql1);
        let rs = {}
        rs.Partner = rs1[0]
        rs.ListItems = rs2
        res.json(rs)
        }
        else{
            res.json({
                Partner:{},
                ListItems:[]
            })
        }
        
    });

    router.get('/cart/:CustomerID/delete', async (req, res) => {
        let result = {status: true,message:"Thành công"};
        let sql = 'DELETE FROM cart WHERE CustomerID  = "' + req.params.CustomerID + '"'
        let rs = await dbs.execute(sql);
        if(rs.affectedRows = 0){
            result.status = false 
            result.message = rs.message
        }
        res.json(result)
    });
};
