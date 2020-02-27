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
        let bind = [await dbs.getNextID('items','itemid'),req.body.PartnerID,req.body.ItemName,req.body.description,req.body.ItemImage]
        let rs = await dbs.execute(`insert into items values(?,?,?,?,?)`, bind);
        res.json(rs);
    });

    router.get('/product/:partnerid',async (req, res) => {
        let rs = await dbs.execute(`select ItemID, ItemName, description, ItemImage from items where PartnerID = ?`, [req.params.partnerid]);
        res.json(rs);
    });

    router.delete('/product/:itemid',async (req, res) => {
        let rs = await dbs.execute(`delete from items where ItemID = ?`, [req.params.itemid]);
        res.json(rs);
    });
};
