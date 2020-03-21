const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');



module.exports = (router) => {
    
    // auth(router, '/admin');
    // API Partner
    //count partner
    router.get('/countPartner', async (req, res) => {
        let rs = await dbs.execute('select count(*) as count from partner');
        res.json(rs);
    });
    /* Get partner*/
    router.post('/getPartner', async (req, res) => {
        var like = req.body.like
        var orderBys= req.body.orderBy
        let sql = 'select * from partner where 1 = 1' 
        like.map( like => {
            sql = sql + ' and ' + like.column + " like '%" +  like.value + "%' "
        })
        sql = sql + ' order by '
        orderBys.map( (orderBy , index )=> {
            if(index+1 == orderBys.length){
                sql = sql +  orderBy.column + ' ' + orderBy.value
            }else{
                sql = sql +  orderBy.column + ' ' + orderBy.value + ', '
            }
        })
         sql = sql + ' limit ' + req.body.limit + ' offset ' + req.body.offset;
         console.log(sql);
         
        let rs = await dbs.execute(sql);
        res.json(rs);
    });

 

    // Enable hoặc disable partner 
    router.post('/PartnerController', async (req, res) => {

        let rs = await dbs.execute('update partner  set  StatusID = ? where PartnerID =  ?',[req.body.StatusID,req.body.PartnerID]);
        res.json(rs);
    });

    // API Product
    //count product 
    router.get('/countProduct', async (req, res) => {
        let rs = await dbs.execute('select count(*) as count from items');
        res.json(rs);
    });
    //Get product
    router.post('/getProduct', async (req, res) => {
        console.log('getProduct')
        var like = req.body.like
        var orderBys= req.body.orderBy
        let sql = 'select * from items where 1 = 1' 
        like.map( like => {
            sql = sql + ' and ' + like.column + " like '%" +  like.value + "%' "
        })
        sql = sql + ' order by '
        orderBys.map( (orderBy , index )=> {
            if(index+1 == orderBys.length){
                sql = sql +  orderBy.column + ' ' + orderBy.value
            }else{
                sql = sql +  orderBy.column + ' ' + orderBy.value + ', '
            }
        })
         sql = sql + ' limit ' + req.body.limit + ' offset ' + req.body.offset
         console.log(sql);
        let rs = await dbs.execute(sql);
       
        res.json(rs);
    });

 

    // Enable hoặc disable product
    router.post('/ProductController', async (req, res) => {
        let rs = await dbs.execute('update items  set  StatusID = ? where ItemID =  ?',[req.body.StatusID,req.body.ItemID]);
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
        var orderBys= req.body.orderBy
        let sql = 'select * from customer where 1 = 1' 
        like.map( like => {
            sql = sql + ' and ' + like.column + " like '%" +  like.value + "%' "
        })
        sql = sql + ' order by '
        orderBys.map( (orderBy , index )=> {
            if(index+1 == orderBys.length){
                sql = sql +  orderBy.column + ' ' + orderBy.value
            }else{
                sql = sql +  orderBy.column + ' ' + orderBy.value + ', '
            }
        })
         sql = sql + ' limit ' + req.body.limit + ' offset ' + req.body.offset
        let rs = await dbs.execute(sql);
        res.json(rs);
    });

    // Enable hoặc disable product
    router.post('/UserController', async (req, res) => {
        let rs = await dbs.execute('update customer  set  StatusID = ? where CustomerID =  ?',[req.body.StatusID,req.body.CustomerID]);
        res.json(rs);
    });
};
