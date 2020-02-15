const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');



module.exports = (router) => {
    
    // auth(router, '/admin');
    
    /* Get all partner*/
    router.get('/getAllPartner/:limit/:page', async (req, res) => {
        let rs = await dbs.execute('select * from partner  order by PartnerID LIMIT ?, ?',[parseInt(req.params.limit),parseInt(req.params.limit)*parseInt(req.params.page)]);
        res.json(rs);
    });

    /* Get partner theo trạng thái */
    router.get('/getPartnerByStatusID/:StatusID/:limit/:page', async (req, res) => {
        let rs = await dbs.execute('select * from partner p where  StatusID = ? order by p.PartnerID LIMIT ?, ?',[req.params.StatusID,parseInt(req.params.limit)*parseInt(req.params.limit),parseInt(req.params.limit)]);
        res.json(rs);
    });

    /* Get partner theo PartnerID*/
    router.get('/getPartnerByPartnerID/:PartnerID', async (req, res) => {
        let rs = await dbs.execute('select * from partner p where  p.PartnerID = ?',[req.params.PartnerID]);
        res.json(rs);
    });

    /* Enable hoặc disable partner */
    router.post('/PartnerController', async (req, res) => {
        console.log(req.body.PartnerID);
        let rs = await dbs.execute('update partner  set  StatusID = ? where PartnerID =  ?',[req.body.StatusID,req.body.PartnerID]);
        res.json(rs);
    });



    

};
