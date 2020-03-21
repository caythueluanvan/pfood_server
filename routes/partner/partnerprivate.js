const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
/* Authentication */


module.exports = (router) => {

    // auth(router, '/partner');

    /* Get User by id */
    router.get('/:id', async (req, res) => {
        let rs = await dbs.execute('SELECT p.PartnerID, p.PartnerName, p.PartnerAddress, p.PartnerEmail, p.PartnerPhone, p.PartnerDescription, p.PartnerImage, c.CityName FROM `partner` p, city c WHERE p.CityID = c.CityID and CustomerID = ?', [req.params.id]);
        res.json(rs);
    });

    router.put('/',async (req, res) => {
        let PartnerID = req.body.PartnerID;
        let body = req.body;
        delete body.PartnerID;
        let key = Object.keys(body);
        let value = Object.values(body);
        let sql = `update partner set `
        let bind = []
        key.forEach((e, i) => {
            sql = sql + (i<key.length-1 ? `?? = ?, ` : `?? = ? `)
            bind.push(e);
            bind.push(value[i]);
        });
        sql = sql + `WHERE ?? = ?`
        bind.push('PartnerID');
        bind.push(PartnerID);
        let rs = await dbs.execute(sql, bind);
        
        
        res.json(rs);
    });

    router.post('/product',async (req, res) => {
         let id = await dbs.getNextID('items','itemid');
        
        
         let bind = [id,req.body.PartnerID,req.body.ItemName,req.body.description,req.body.img, 0]
         let rs = await dbs.execute(`insert into items(itemid, partnerid, itemname, description, itemimage, statusid) values(?,?,?,?,?,?)`, bind);
         console.log(rs);
         
        res.json(rs);
    });

    router.get('/product/:partnerid',async (req, res) => {
        let rs = await dbs.execute(`select i.ItemID, i.ItemName, i.description, i.ItemImage, i.StatusID, s.StatusName from items i, status s where i.statusid=s.statusid and PartnerID = ?`, [req.params.partnerid]);
        res.json(rs);
    });

    router.delete('/product/:itemid',async (req, res) => {
        let rs = await dbs.execute(`delete from items where ItemID = ?`, [req.params.itemid]);
        res.json(rs);
    });

    router.put('/product',async (req, res) => {
        let bind = [req.body.ItemName, req.body.description, req.body.ItemImage, req.body.ItemID];
        let rs = await dbs.execute(`update items set ItemName = ?, description = ?, ItemImage = ? where ItemID = ?`, bind);
        res.json(rs);
    });
    //

    router.post('/sourceofitems',async (req, res) => {
        let bind = [await dbs.getNextID('sourceofitems','SourceOfItemsID'),req.body.ItemID,req.body.Summary,req.body.Price,new Date(req.body.StartTime),new Date(req.body.EndTime),req.body.Description]
        let rs = await dbs.execute(`insert into sourceofitems(SourceOfItemsID, ItemID, Summary, Price, StartTime, EndTime, Description) values(?,?,?,?,?,?,?)`, bind);                
        res.json(rs);
    });

    router.get('/sourceofitems/:partnerid',async (req, res) => {
        let rs = await dbs.execute(`SELECT s.*, i.ItemName, i.ItemImage FROM sourceofitems s, items i WHERE s.ItemID = i.ItemID and i.partnerid = ? and s.EndTime >= now()`, [req.params.partnerid]);
        res.json(rs);
    });
};
