const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
/* Authentication */


module.exports = (router) => {

    auth(router, '/partner');
    
    /* Get All User */
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from customer');
        res.json(rs);
    });
};
