const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');



module.exports = (router) => {
    
    // auth(router, '/admin');
    
    /* Get all partner*/
    router.get('/getAllPartner/:limit/:page', async (req, res) => {
        let rs = await dbs.execute('select p.* from partner p, customer c where p.CustomerID = c.CustomerID');
        res.json(rs);
    });

    /* Get partner theo trạng thái */
    router.get('/getPartnerByStatusID/:StatusID:/:limit/:page', async (req, res) => {
        let rs = await dbs.execute('select * from partner p where  StatusID = ? order by p.PartnerID LIMIT ?, ?',[req.param.StatusID,req.param.limit,req.param.limit*req.param.page]);
        res.json(rs);
    });

    /* Get partner theo PartnerID*/
    router.get('/getPartnerByPartnerID/:PartnerID', async (req, res) => {
        let rs = await dbs.execute('select * from partner p, customer c where p.CustomerID = c.CustomerID and p.PartnerID = ?',[req.param.PartnerID]);
        res.json(rs);
    });

    /* Enable hoặc disable partner */
    router.post('/PartnerController', async (req, res) => {
        console.log(req.body.PartnerID);
        let rs = await dbs.execute('update partner  set  StatusID = ? where PartnerID =  ?',[req.body.StatusID,req.body.PartnerID]);
        res.json(rs);
    });



    

};
