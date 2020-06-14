const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');



module.exports = (router) => {

    // auth(router, '/admin');
    // API Partner
    //count partner
    router.get('/homepage', async (req, res) => {
        let rsItemsActive = await dbs.execute(`SELECT count(*) as count FROM itempartner WHERE STATUSid = 1`, []);

        let rsSourceOfItemsActive = await dbs.execute(`SELECT count(*) as count FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and s.EndTime >= now() and year(s.EndTime) =?`, [req.headers.year]);
        let rsSourceOfItemsOfYear = await dbs.execute(`SELECT count(*) as count FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and year(s.EndTime) =?`, [req.headers.year]);
        let rsOrderActive = await dbs.execute('select count(DISTINCT od.orderid) as count from orderdetail od, `order` o where o.orderid = od.orderid and o.statusid = 1 and od.SourceOfItemsID in (SELECT SourceOfItemsID FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and year(o.adddate) =?)', [req.headers.year]);
        let rsOrderOfYear = await dbs.execute('select count(DISTINCT od.orderid) as count from orderdetail od,`order` o where o.orderid = od.orderid and od.SourceOfItemsID in (SELECT SourceOfItemsID FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and year(o.adddate) =?)', [req.headers.year]);
        let rsTotal = await dbs.execute('SELECT ifnull(sum( od.Total*s.Price), 0) as total FROM sourceofitems s, itempartner i, orderdetail od, `order` o WHERE o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and year(o.adddate) = ?', [req.headers.year]);

        let rsTotalByMonth = await dbs.execute('select count from (select a.month as month, sum(a.count) as count from (select 1 as month, 0 count union select 2 as month, 0 count union select 3 as month, 0 count  union select 4 as month, 0 count union select 5 as month, 0 count union select 6 as month, 0 count union select 7 as month, 0 count union select 8 as month, 0 count union select 9 as month, 0 count union select 10 as month, 0 count union select 11 as month, 0 count union select 12 as month, 0 COUNT union SELECT month(o.addDate) month, sum( od.Total*s.Price) count FROM sourceofitems s, itempartner i, orderdetail od, `order` o WHERE o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and year(s.EndTime) =? group by month(o.addDate)) a group by a.month) a ', [req.headers.year]);

        let rsTotalByMonthLastYear = await dbs.execute('select count from (select a.month as month, sum(a.count) as count from (select 1 as month, 0 count union select 2 as month, 0 count union select 3 as month, 0 count union select 4 as month, 0 count union select 5 as month, 0 count union select 6 as month, 0 count union select 7 as month, 0 count union select 8 as month, 0 count union select 9 as month, 0 count union select 10 as month, 0 count union select 11 as month, 0 count union select 12 as month, 0 COUNT union SELECT month(o.addDate) month, sum( od.Total*s.Price) count FROM sourceofitems s, itempartner i, orderdetail od, `order` o WHERE o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and year(s.EndTime) =? group by month(o.addDate)) a group by a.month) a', [req.headers.year - 1]);

        let rsPercentByCategory = await dbs.execute('select CategoryName as name, total, round(total / (SUM(total) OVER (ORDER BY null))* 100) as percent from (SELECT c.CategoryName,sum(od.Total*s.Price) total FROM sourceofitems s, itempartner i, items it, orderdetail od, `order` o, category c WHERE it.ItemID = i.itemid and c.CategoryID = it.CategoryID and o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and year(s.EndTime) = ? group by it.CategoryID) a', [req.headers.year]);

        let rsLatestSourceOfItem = await dbs.execute(`SELECT s.SourceOfItemsID, s.StartTime, s.EndTime, it.ItemName, i.ItemImage FROM sourceofitems s, itempartner i, items it WHERE i.itemid = it.ItemID and s.ItemID = i.id order by EndTime desc limit 5`, []);

        let rsLatestOrder = await dbs.execute('SELECT o.orderid, o.adddate, c.CustomerName,stt.StatusID, stt.StatusName, sum( od.Total*s.Price) as total FROM sourceofitems s, itempartner i, orderdetail od, `order` o, customer c, status stt WHERE o.statusid = stt.StatusID and c.CustomerID = o.customerid and o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID group by o.orderid, o.adddate, c.CustomerName, stt.StatusName order by adddate desc limit 6', []);
        res.json({
            rsItemsActive: rsItemsActive[0].count,
            rsSourceOfItemsActive: rsSourceOfItemsActive[0].count, rsSourceOfItemsOfYear: rsSourceOfItemsOfYear[0].count, rsOrderActive: rsOrderActive[0].count, rsOrderOfYear: rsOrderOfYear[0].count, rsTotal: rsTotal[0].total, rsTotalByMonth: rsTotalByMonth, rsTotalByMonthLastYear: rsTotalByMonthLastYear, rsPercentByCategory: rsPercentByCategory, rsLatestSourceOfItem: rsLatestSourceOfItem, rsLatestOrder: rsLatestOrder
        });
    });

    router.get('/countPartner', async (req, res) => {
        let rs = await dbs.execute('select count(*) as count from partner');
        res.json(rs);
    });
    /* Get partner*/
    router.post('/getPartner', async (req, res) => {
        var like = req.body.like
        var orderBys = req.body.orderBy
        let sql = 'select p.*, s.StatusName from partner p, status s where 1 = 1 and s.StatusID = p.StatusID '
        like.map(like => {
            if (like.value != "" && like.value != undefined && like.value != null) {
                sql = sql + ' and ' + like.column + ' like "%' + like.value + '%" '
            }
        })
        sql = sql + ' order by '
        orderBys.map((orderBy, index) => {
            if (index + 1 == orderBys.length) {
                sql = sql + orderBy.column + ' ' + orderBy.value
            } else {
                sql = sql + orderBy.column + ' ' + orderBy.value + ', '
            }
        })
        sql = sql + ' limit ' + req.body.limit + ' offset ' + req.body.offset;
        // console.log(sql);

        let rs = await dbs.execute(sql);
        res.json(rs);
    });



    // Enable hoặc disable partner 
    router.post('/PartnerController', async (req, res) => {
        if (req.body.status_old == 0) {
            let id = Math.floor(Math.random() * (999999 - 100000))
            const saltRounds = 10;
            let salt = bcrypt.genSaltSync(saltRounds);
            let pass = bcrypt.hashSync(id.toString(), salt);
            let rs1 = await dbs.execute('update partner  set  PartnerPassword = "' + pass + '" where PartnerID =  "' + req.body.PartnerID + '"')

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'tdhoang96',
                    pass: 'giongnhuid0'
                }
            });
            let sql5 = 'select PartnerEmail, partnername, partneraddress, partnerphone from partner where PartnerID =  "' + req.body.PartnerID + '"'
            let rs5 = await dbs.execute(sql5)



            let content = "<b>Chúc mừng bạn đã đăng ký thành công trở thành đối tác của ứng dụng Pfood !</b><br>"
            content += "<p>username :" + rs5[0].PartnerEmail + "</p>"
            content += "<p>Password : " + id + "</p>"
            // send mail with defined transport objec
            transporter.sendMail({
                from: '"tdhoang96" <tdhoang96@gmail.com>', // sender address
                to: rs5[0].PartnerEmail, // list of receivers
                subject: "Thông báo thông tin đăng ký đối tác của PFOOD", // Subject line
                text: "", // plain text body
                html: content // html body
            }, (error, info) => {
                if (error) {
                    res.json({ status: false, message: error })
                }
            });
            let customerid = await dbs.getNextID('customer', 'customerid');
            await dbs.execute('update partner  set customerid = ? where PartnerID =  ?', [customerid, req.body.PartnerID]);
            let bind = [customerid, rs5[0].partnername, rs5[0].PartnerEmail, pass, rs5[0].partneraddress, rs5[0].partnerphone, rs5[0].PartnerEmail, 1];
            await dbs.execute(`insert into customer(CustomerID, CustomerName, CustomerUsername, CustomerPassword, 
                CustomerAddress, CustomerPhone, CustomerEmail, StatusID) values(?, ?, ?, ?, ?, ?, ?, ?)`, bind);
        }
         await dbs.execute('update partner  set  StatusID = ? where PartnerID =  ?', [req.body.StatusID, req.body.PartnerID]);
        res.json({ status: true, message: "thanh cong" })
    });

    // API Product
    //count product 
    router.get('/countProduct', async (req, res) => {
        let sql = 'select count(*) as dem from items'
        let rs = await dbs.execute(sql);
        res.json(rs[0].dem);
    });

    router.get('/countProcessProduct', async (req, res) => {
        let sql = 'select * from itempartner where statusid = 0 and notication = 1'
        let rs = await dbs.execute(sql);
        rs.map(async r => {
            let sql1 = 'update itempartner set notication = 0 where id = "' + r.ItemID + '"'
            let rs = await dbs.execute(sql1);
        })
        res.json(rs);
    });
    //Get product
    router.post('/getProduct', async (req, res) => {
        // console.log('getProduct')
        var like = req.body.like
        var orderBys = req.body.orderBy
        let sql = 'select i.*, p.PartnerName, (select s.Price from sourceofitems s where s.ItemID = i.ItemID order by s.EndTime DESC limit 1)  Price from items i, partner p where 1 = 1 and p.PartnerID = i.PartnerID'
        like.map(like => {
            if (like.value != "" && like.value != undefined && like.value != null) {
                sql = sql + ' and ' + like.column + ' like "%' + like.value + '%" '
            }
        })
        sql = sql + ' order by '
        orderBys.map((orderBy, index) => {
            if (index + 1 == orderBys.length) {
                sql = sql + orderBy.column + ' ' + orderBy.value
            } else {
                sql = sql + orderBy.column + ' ' + orderBy.value + ', '
            }
        })
        sql = sql + ' limit ' + req.body.limit + ' offset ' + req.body.offset
        // console.log(sql);
        let rs = await dbs.execute(sql);

        res.json(rs);
    });



    // Enable hoặc disable product
    router.post('/ProductController', async (req, res) => {
        let rs = await dbs.execute('update items  set  StatusID = "' + req.body.StatusID + '" where ItemID =  "' + req.body.ItemID + '"');
        res.json(rs);
    });

    // API User 
    //count user 
    router.get('/countUser', async (req, res) => {
        let rs = await dbs.execute('select count(*) as count from customer');
        res.json(rs);
    });
    //Get user
    router.post('/getUser', async (req, res) => {
        var like = req.body.like
        var orderBys = req.body.orderBy
        let sql = 'select * from customer where 1 = 1'
        like.map(like => {
            sql = sql + ' and ' + like.column + " like '%" + like.value + "%' "
        })
        sql = sql + ' order by '
        orderBys.map((orderBy, index) => {
            if (index + 1 == orderBys.length) {
                sql = sql + orderBy.column + ' ' + orderBy.value
            } else {
                sql = sql + orderBy.column + ' ' + orderBy.value + ', '
            }
        })
        sql = sql + ' limit ' + req.body.limit + ' offset ' + req.body.offset
        let rs = await dbs.execute(sql);
        res.json(rs);
    });

    // Enable hoặc disable product
    router.post('/UserController', async (req, res) => {
        let rs = await dbs.execute('update customer  set  StatusID = ? where CustomerID =  ?', [req.body.StatusID, req.body.CustomerID]);
        res.json(rs);
    });

    router.get('/parameters', async (req, res) => {
        let sql = "select * from parameters";
        let rs = await dbs.execute(sql)
        res.json(rs);
    });

    router.post('/parameters/update', async (req, res) => {
        let result = { status: true, message: "Thành công" };
        req.body.ListParam.map(async p => {
            let sql = 'update parameters  set  ParamValue = "' + p.ParamValue + '" where ParamName = "' + p.ParamName + '"'
            // console.log(sql)
            let rs = await dbs.execute(sql);
        })

        res.json(result)
    });
};
