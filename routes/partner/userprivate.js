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

    router.put('/', (req, res) => {
        console.log(req.body);
        
        // let rs = await dbs.execute('SELECT p.PartnerID, p.PartnerName, p.PartnerAddress, p.PartnerEmail, p.PartnerPhone, p.PartnerDescription, p.PartnerImage, c.CityName FROM partner p, city c WHERE p.CityID = c.CityID and CustomerID = ?', [req.params.id]);
        res.json({a:'a'});
    });
};
