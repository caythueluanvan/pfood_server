const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const XLSX = require('xlsx');
var multer = require('multer');
const xlsFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(xls|xlsx)$/)) return cb(new Error('Chỉ chọn định dạng file excel!'), false)
    cb(null, true)
}
var upload = multer({ storage: multer.memoryStorage(), fileFilter: xlsFilter, limits: { fileSize: 10485760 } });
/* Authentication */


module.exports = (router) => {

    // auth(router, '/partner');

    /* Get User by id */
    // router.get('/:id', async (req, res) => {        
    //     let rs = await dbs.execute('SELECT p.PartnerID, p.PartnerName, p.PartnerAddress, p.PartnerEmail, p.PartnerPhone, p.PartnerDescription, p.PartnerImage, c.CityName FROM `partner` p, city c WHERE p.CityID = c.CityID and CustomerID = ?', [req.params.id]);
    //     res.json(rs);
    // });

    router.put('/', async (req, res) => {
        console.log(req.body);
        
        let PartnerID = req.body.PartnerID;
        let body = req.body;
        delete body.PartnerID;
        let key = Object.keys(body);
        let value = Object.values(body);
        let sql = `update partner set `
        let bind = []
        key.forEach((e, i) => {
            sql = sql + (i < key.length - 1 ? `?? = ?, ` : `?? = ? `)
            bind.push(e);
            bind.push(value[i]);
        });
        sql = sql + `WHERE ?? = ?`
        bind.push('PartnerID');
        bind.push(PartnerID);
        let rs = await dbs.execute(sql, bind);


        res.json(rs);
    });

    router.post('/product', async (req, res) => {

        try {
            let productId = await dbs.getNextID('items', 'itemid');
            if (req.body.productId!=='' && req.body.productId!== null && req.body.productId) {
                 productId = req.body.productId;
            }else {
                await dbs.execute(`insert into items(ItemID, ItemName, CategoryID) values(?,?,?)`, [productId, req.body.ItemName, req.body.category]);
            }
            let itemPartnerId = await dbs.getNextID('itempartner', 'id');
            let bind = [itemPartnerId, req.body.PartnerID, productId,  req.body.description, req.body.defaultprice, req.body.img, 0]
            let rs = await dbs.execute(`insert into itempartner(id, partnerid, itemid, description, defaultprice, itemimage, statusid) values(?,?,?,?,?,?,?)`, bind);
            
            if (req.body.scheduleDay.length) {
                let bind = [];
                req.body.scheduleDay.forEach(e => {
                    bind.push([itemPartnerId, e, req.body.scheduleTimeFrom, req.body.scheduleTimeTo, req.body.schedulePrice, req.body.scheduleAmount])
                });
                await dbs.execute(`insert into scheduleitem(Item_ID, dayofweek, timefrom, timeto, price, amount) values ?`, [bind]);
            }
            if (rs.affectedRows > 0) {
                let rsAdd = await dbs.execute(`select ip.id, i.ItemName, i.categoryID, c.categoryName,  ip.description, GROUP_CONCAT(si.dayofweek) scheduleDay, si.price schedulePrice, si.amount scheduleAmount, si.timefrom scheduleTimeFrom, si.timeto scheduleTimeTo, ip.ItemImage, ip.defaultprice, ip.StatusID, s.StatusName from itempartner ip left join scheduleitem si on ip.id = si.item_id, status s, category c, items i where ip.statusid=s.statusid and i.categoryID = c.categoryID and i.ItemID = ip.itemid and ip.id = ? GROUP BY ip.id`, [itemPartnerId])
                res.json({ type: 'success', msg: 'Thêm thành công !', product: rsAdd });
            } else {
                res.json({ type: 'fail', msg: 'Thêm không thành công !' });
            }
        } catch (error) {
            console.log(error);
            res.json({ type: 'fail', msg: error });
        }

    });

    router.get('/product/:partnerid', async (req, res) => {
        let rs = await dbs.execute(`select ip.id, i.ItemName, i.categoryID, c.categoryName,  ip.description, GROUP_CONCAT(si.dayofweek) scheduleDay, si.price schedulePrice, si.amount scheduleAmount, si.timefrom scheduleTimeFrom, si.timeto scheduleTimeTo, ip.ItemImage, ip.defaultprice, ip.StatusID, s.StatusName from itempartner ip left join scheduleitem si on ip.id = si.item_id, status s, category c, items i where ip.statusid=s.statusid and i.categoryID = c.categoryID and i.ItemID = ip.itemid and ip.PartnerID = ? GROUP BY ip.id`, [req.params.partnerid]);
        res.json(rs);
    });

    router.delete('/product/:itemid', async (req, res) => {
        let rs = await dbs.execute(`delete from itempartner where id = ?`, [req.params.itemid]);
        if (rs.affectedRows > 0) {
            res.json({ type: 'success', msg: 'Xóa thành công !', productId: req.params.itemid });
        } else {
            res.json({ type: 'fail', msg: 'Xóa không thành công !' });
        }
    });

    router.put('/product', async (req, res) => {
        let bind = [req.body.description, req.body.ItemImage, req.body.id];
        let rs = await dbs.execute(`update itempartner set description = ?, ItemImage = ? where id = ?`, bind);
        await dbs.execute(`delete from scheduleitem where Item_ID = ?`, [req.body.id]);
        if (req.body.scheduleDay != null && req.body.scheduleDay.length) {
            let bind = [];
            req.body.scheduleDay.forEach(e => {
                bind.push([req.body.ItemID, e, req.body.scheduleTimeFrom, req.body.scheduleTimeTo, req.body.schedulePrice, req.body.scheduleAmount])
            });
            await dbs.execute(`insert into scheduleitem(Item_ID, dayofweek, timefrom, timeto, price, amount) values ?`, [bind]);
        }
        if (rs.affectedRows > 0) {
            let rsEdit = await dbs.execute(`select ip.id, i.ItemName, i.categoryID, c.categoryName,  ip.description, GROUP_CONCAT(si.dayofweek) scheduleDay, si.price schedulePrice, si.amount scheduleAmount, si.timefrom scheduleTimeFrom, si.timeto scheduleTimeTo, ip.ItemImage, ip.defaultprice, ip.StatusID, s.StatusName from itempartner ip left join scheduleitem si on ip.id = si.item_id, status s, category c, items i where ip.statusid=s.statusid and i.categoryID = c.categoryID and i.ItemID = ip.itemid and ip.id = ? GROUP BY ip.id`, [req.body.id]);
            res.json({ type: 'success', msg: 'Sửa thành công !', product: rsEdit });
        } else {
            res.json({ type: 'fail', msg: 'Sửa không thành công !' });
        }
    });
    //

    router.post('/sourceofitems', async (req, res) => {
        let bind = [await dbs.getNextID('sourceofitems', 'SourceOfItemsID'), req.body.ItemID, req.body.Summary, req.body.Price, new Date(req.body.StartTime), new Date(req.body.EndTime), req.body.Description, req.body.Image]
        let rs = await dbs.execute(`insert into sourceofitems(SourceOfItemsID, ItemID, Summary, Price, StartTime, EndTime, Description, Image) values(?,?,?,?,?,?,?, ?)`, bind);
        if (rs.affectedRows > 0) {
            res.json({ type: 'success', msg: 'Đăng bán thành công !' });
        } else {
            res.json({ type: 'fail', msg: 'Đăng bán không thành công !' });
        }
    });

    router.get('/sourceofitems/:partnerid', async (req, res) => {
        let rs = await dbs.execute(`SELECT s.*, it.ItemName, i.ItemImage FROM sourceofitems s, itempartner i, items it WHERE i.itemid = it.ItemID and s.ItemID = i.ItemID and i.partnerid = ? and s.EndTime >= now()`, [req.params.partnerid]);
        res.json(rs);
    });

    router.get('/itemsbycategory/:cateid', async (req, res) => {
        let rs = await dbs.execute(`SELECT itemid, itemname from items where categoryid = ?`, [req.params.cateid]);
        res.json(rs);
    });

    // router.post('/import', upload.single('file'), async (req, res) => {
    //     let file = req.file;
    //     wb = XLSX.read(file.buffer, { type: 'buffer' })
    //     sheetName = wb.SheetNames[0]
    //     ws = wb.Sheets[sheetName]
    //     ref = XLSX.utils.decode_range(ws['!ref'])
    //     range = XLSX.utils.encode_range(ref)
    //     let header = ['item', 'description']
    //     arr = XLSX.utils.sheet_to_json(ws, { header: header, defval: null, blankrows: false, range: range })
    //     arr.shift();
    //     let productid = await dbs.getNextID('items', 'itemid');
    //     let bind = [];
    //     let err = null;
    //     arr.forEach((e, i) => {
    //         let id = 'items' + ((parseInt(productid.replace('items', '')) + i).toString().padStart(20 - 'items'.length, '0'));
    //         if (e.item === null) {
    //             err = 'Tên sản phẩm không được để trống!';
    //         }
    //         bind.push([id, req.body.PartnerID, e.item, e.description, 0])
    //     });

    //     if (err) {
    //         res.json({ msg: err });
    //     } else {
    //         let rs = await dbs.execute(`insert into items(ItemID, PartnerID, ItemName, description, StatusID) values ?`, [bind]);
    //         res.json(rs);
    //     }

    // });

    router.get('/homepage', async (req, res) => {
        let rsItemsActive = await dbs.execute(`SELECT count(*) as count FROM itempartner WHERE STATUSid = 1 and PartnerID = ?`, [req.headers.partnerid]);

        let rsSourceOfItemsActive = await dbs.execute(`SELECT count(*) as count FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and s.EndTime >= now() and PartnerID = ? and year(s.EndTime) =?`, [req.headers.partnerid, req.headers.year]);
        let rsSourceOfItemsOfYear = await dbs.execute(`SELECT count(*) as count FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and PartnerID = ? and year(s.EndTime) =?`, [req.headers.partnerid, req.headers.year]);
        let rsOrderActive = await dbs.execute('select count(DISTINCT od.orderid) as count from orderdetail od, `order` o where o.orderid = od.orderid and o.statusid = 1 and od.SourceOfItemsID in (SELECT SourceOfItemsID FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and PartnerID = ? and year(o.adddate) =?)', [req.headers.partnerid, req.headers.year]);
        let rsOrderOfYear = await dbs.execute('select count(DISTINCT od.orderid) as count from orderdetail od,`order` o where o.orderid = od.orderid and od.SourceOfItemsID in (SELECT SourceOfItemsID FROM sourceofitems s, itempartner i WHERE s.ItemID = i.id and i.PartnerID = ? and year(o.adddate) =?)', [req.headers.partnerid, req.headers.year]);
        let rsTotal = await dbs.execute('SELECT ifnull(sum( od.Total*s.Price), 0) as total FROM sourceofitems s, itempartner i, orderdetail od, `order` o WHERE o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and i.PartnerID = ? and year(o.adddate) = ?', [req.headers.partnerid, req.headers.year]);

        let rsTotalByMonth = await dbs.execute('select count from (select a.month as month, sum(a.count) as count from (select 1 as month, 0 count union select 2 as month, 0 count union select 3 as month, 0 count  union select 4 as month, 0 count union select 5 as month, 0 count union select 6 as month, 0 count union select 7 as month, 0 count union select 8 as month, 0 count union select 9 as month, 0 count union select 10 as month, 0 count union select 11 as month, 0 count union select 12 as month, 0 COUNT union SELECT month(o.addDate) month, sum( od.Total*s.Price) count FROM sourceofitems s, itempartner i, orderdetail od, `order` o WHERE o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and i.PartnerID = ? and year(s.EndTime) =? group by month(o.addDate)) a group by a.month) a ', [req.headers.partnerid, req.headers.year]);

        let rsTotalByMonthLastYear = await dbs.execute('select count from (select a.month as month, sum(a.count) as count from (select 1 as month, 0 count union select 2 as month, 0 count union select 3 as month, 0 count union select 4 as month, 0 count union select 5 as month, 0 count union select 6 as month, 0 count union select 7 as month, 0 count union select 8 as month, 0 count union select 9 as month, 0 count union select 10 as month, 0 count union select 11 as month, 0 count union select 12 as month, 0 COUNT union SELECT month(o.addDate) month, sum( od.Total*s.Price) count FROM sourceofitems s, itempartner i, orderdetail od, `order` o WHERE o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and i.PartnerID = ? and year(s.EndTime) =? group by month(o.addDate)) a group by a.month) a', [req.headers.partnerid, req.headers.year - 1]);

        let rsPercentByCategory = await dbs.execute('select CategoryName as name, total, round(total / (SUM(total) OVER (ORDER BY null))* 100) as percent from (SELECT c.CategoryName,sum(od.Total*s.Price) total FROM sourceofitems s, itempartner i, items it, orderdetail od, `order` o, category c WHERE it.ItemID = i.itemid and c.CategoryID = it.CategoryID and o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and o.statusid !=3 and i.PartnerID = ? and year(s.EndTime) = ? group by it.CategoryID) a', [req.headers.partnerid, req.headers.year]);

        let rsLatestSourceOfItem = await dbs.execute(`SELECT s.SourceOfItemsID, s.StartTime, s.EndTime, it.ItemName, i.ItemImage FROM sourceofitems s, itempartner i, items it WHERE i.itemid = it.ItemID and s.ItemID = i.id and PartnerID = ? order by EndTime desc limit 5`, [req.headers.partnerid]);

        let rsLatestOrder = await dbs.execute('SELECT o.orderid, o.adddate, c.CustomerName,stt.StatusID, stt.StatusName, sum( od.Total*s.Price) as total FROM sourceofitems s, itempartner i, orderdetail od, `order` o, customer c, status stt WHERE o.statusid = stt.StatusID and c.CustomerID = o.customerid and o.OrderID = od.OrderID and s.ItemID = i.id and od.SourceOfItemsID = s.SourceOfItemsID and i.PartnerID = ? group by o.orderid, o.adddate, c.CustomerName, stt.StatusName order by adddate desc limit 6', [req.headers.partnerid]);
        res.json({
            rsItemsActive: rsItemsActive[0].count,
            rsSourceOfItemsActive: rsSourceOfItemsActive[0].count, rsSourceOfItemsOfYear: rsSourceOfItemsOfYear[0].count, rsOrderActive: rsOrderActive[0].count, rsOrderOfYear: rsOrderOfYear[0].count, rsTotal: rsTotal[0].total, rsTotalByMonth: rsTotalByMonth, rsTotalByMonthLastYear: rsTotalByMonthLastYear, rsPercentByCategory: rsPercentByCategory, rsLatestSourceOfItem: rsLatestSourceOfItem, rsLatestOrder: rsLatestOrder
        });
    });

    router.get('/order/:partnerid', async (req, res) => {
        let rs = await dbs.execute('SELECT distinct o.orderid, o.customerid, c.CustomerName, o.ordernote, o.ship, o.adddate, o.rejectdate, o.approvedate, o.statusid, s.StatusName FROM itempartner i, SourceOfItems si, orderdetail od, `order` o, status s, customer c WHERE i.partnerid = ? and i.id = si.itemid and si.SourceOfItemsID = od.SourceOfItemsID and o.orderid = od.OrderID and o.statusid = s.StatusID and c.CustomerID  = o.CustomerID order by o.adddate desc', [req.params.partnerid]);
        res.json(rs);
    });

    router.put('/order', async (req, res) => {
        let dateUpdate = 'approvedate';
        if (req.body.status == 3) {
            let rs = await dbs.execute('select sourceofitemsid, total from orderdetail where orderid = ?', [req.body.orderid]);
            let sql = 'update sourceofitems set summary = summary + case ';
            sqlwhere = []
            rs.forEach(e => {
                sql = sql + ` when SourceOfItemsID = '${e.sourceofitemsid}' then ${e.total}`
                sqlwhere.push(`'${e.sourceofitemsid}'`);
            });
            sql = sql + ` end where SourceOfItemsID in (${sqlwhere.toString()})`;
            await dbs.execute(sql, []);
            dateUpdate = 'rejectdate';
        }


        let rs = await dbs.execute('update `order` set statusid = ?, ?? = now() where orderid = ? ', [req.body.status, dateUpdate, req.body.orderid]);
        if (rs.affectedRows > 0) {
            let rsOrder = await dbs.execute('SELECT o.orderid, o.customerid, c.CustomerName, o.ordernote, o.ship, o.adddate, o.rejectdate, o.approvedate, o.statusid, s.StatusName FROM itempartner i, SourceOfItems si, orderdetail od, `order` o, status s, customer c WHERE o.orderid = ? and i.id = si.itemid and si.SourceOfItemsID = od.SourceOfItemsID and o.orderid = od.OrderID and o.statusid = s.StatusID and c.CustomerID  = o.CustomerID order by o.adddate desc', [req.body.orderid]);
            res.json({ type: 'success', msg: 'Cập nhật trạng thái thành công !', order: rsOrder });
        } else {
            res.json({ type: 'fail', msg: 'Cập nhật trạng thái không thành công !' });
        }
    });
    router.get('/detailorderbyid', async (req, res) => {
        let rsOrder = await dbs.execute('SELECT o.orderid, o.customerid, c.CustomerName,c.CustomerPhone, o.ordernote, o.ship,o.shipaddress, o.adddate, o.rejectdate, o.approvedate, o.statusid, s.StatusName FROM itempartner i, SourceOfItems si, orderdetail od, `order` o, status s, customer c WHERE o.orderid = ? and i.id = si.itemid and si.SourceOfItemsID = od.SourceOfItemsID and o.orderid = od.OrderID and o.statusid = s.StatusID and c.CustomerID  = o.CustomerID order by o.adddate desc', [req.headers.orderid]);
        let rsOrderDetail = await dbs.execute('SELECT o.orderid,it.ItemName, si.SourceOfItemsID,i.ItemImage Image, od.total, od.price, od.Description FROM itempartner i, items it, SourceOfItems si, orderdetail od, `order` o, status s, customer c WHERE o.orderid = ? and i.itemid = it.ItemID and i.id = si.itemid and si.SourceOfItemsID = od.SourceOfItemsID and o.orderid = od.OrderID and o.statusid = s.StatusID and c.CustomerID  = o.CustomerID order by o.adddate desc', [req.headers.orderid]);
        res.json({ order: rsOrder[0], orderDetail: rsOrderDetail });
    });

    // router.get('/promotionproductadd/:partnerid', async (req, res) => {
    //     let rs = await dbs.execute(`select i.ItemID, i.ItemName, i.ItemImage from items i  where i.statusid = 1 and i.itemid not in (select itemid from promotion where endtime > now()) and PartnerID = ?`, [req.params.partnerid]);
    //     res.json(rs);
    // });

    router.get('/promotiontype', async (req, res) => {
        let rs = await dbs.execute(`select promotiontypeid, promotiontypename from promotiontype`, []);
        res.json(rs);
    });

    router.get('/promotioncondition', async (req, res) => {
        let rs = await dbs.execute(`select conditionid, conditionname from promotioncondition`, []);
        res.json(rs);
    });

    router.post('/promotion', async (req, res) => {
        let item = req.body.item;
        let bind = [req.body.partnerId, req.body.type, req.body.condition, req.body.StartTime, req.body.EndTime];
        let rs = await dbs.execute(`insert into promotion(partnerId, promotiontypeid, promotionconditionid, starttime, endtime) values(?,?,?,?,?)`, bind);
        if (rs.affectedRows > 0) {
            res.json({ type: 'success', msg: 'Thêm khuyến mại thành công !' });
        } else {
            res.json({ type: 'fail', msg: 'Thêm khuyến mại không thành công !' });
        }
    });

    router.get('/promotion/:partnerid', async (req, res) => {
        let rs = await dbs.execute(`select p.promotionid, p.partnerID, pt.promotiontypename, pc.conditionname, p.starttime, p.endtime, case when p.starttime < now() and now() < p.endtime then 'Đang diễn ra' when p.endtime < now() then 'Đã kết thúc' when p.starttime > now() then 'Chưa diễn ra' end as status from promotion p, promotioncondition pc, promotiontype pt where pc.conditionid = p.promotionconditionid and pt.promotiontypeid = p.promotiontypeid and p.PartnerID = ? order by p.promotionid desc`, [req.params.partnerid]);
        res.json(rs);
    });
};
