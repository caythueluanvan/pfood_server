const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');



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
        let sql = 'select p.*, s.StatusName from partner p, status s where 1 = 1 and s.StatusID = p.StatusID '  
        like.map( like => {
            if(like.value != "" && like.value != undefined && like.value != null){
            sql = sql + ' and ' + like.column + ' like "%' +  like.value + '%" '
            }
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
        if(req.body.status_old == 0){
            let id = Math.floor(Math.random()*(999999-100000))
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
            let sql5 = 'select PartnerEmail from partner where PartnerID =  "' + req.body.PartnerID + '"'
            let rs5 = await dbs.execute(sql5)



            let content = "<b>Bạn đã đang ký làm đối tác của PFOOD thành công với thông tin truy cập như sau :</b><br>" 
            content += "<p>username :" + rs5[0].PartnerEmail + "</p>" 
            content += "<p>Password : " + id + "</p>"
            // send mail with defined transport objec
            transporter.sendMail({
              from: '"tdhoang96" <tdhoang96@gmail.com>', // sender address
              to: rs5[0].PartnerEmail, // list of receivers
              subject: "Thông báo thông tin đăng ký đối tác của PFOOD", // Subject line
              text: "", // plain text body
              html: content // html body
            },(error,info)=>{
                if(error){
                    res.json({status:false, message: error })
                }
             
            });
        }
        let rs = await dbs.execute('update partner  set  StatusID = ? where PartnerID =  ?',[req.body.StatusID,req.body.PartnerID]);
        res.json({status:true, message: "thanh cong"})
    });

    // API Product
    //count product 
    router.get('/countProduct', async (req, res) => {
        let sql = 'select count(*) as dem from items'
        let rs = await dbs.execute(sql);
        res.json(rs[0].dem);
    });

    router.get('/countProcessProduct', async (req, res) => {
        let sql = 'select * from items where statusid = 0 and notication = 1'
        let rs = await dbs.execute(sql);
        rs.map(async r => {
            let sql1 = 'update items set notication = 0 where ItemID = "' + r.ItemID +'"'
            let rs = await dbs.execute(sql1);
        })
        res.json(rs);
    });
    //Get product
    router.post('/getProduct', async (req, res) => {
        console.log('getProduct')
        var like = req.body.like
        var orderBys= req.body.orderBy
        let sql = 'select i.*, p.PartnerName, (select s.Price from sourceofitems s where s.ItemID = i.ItemID order by s.EndTime DESC limit 1)  Price from items i, partner p where 1 = 1 and p.PartnerID = i.PartnerID' 
        like.map( like => {
            if(like.value != "" && like.value != undefined && like.value != null){
            sql = sql + ' and ' + like.column + ' like "%' +  like.value + '%" '
            }
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

    router.get('/parameters', async (req, res) => {
        let sql = "select * from parameters";
        let rs = await dbs.execute(sql)
        res.json(rs);
    });

    router.post('/parameters/update', async (req, res) => {
        let result = {status: true,message:"Thành công"};
        req.body.ListParam.map( async p => {
            let sql = 'update parameters  set  ParamValue = "' + p.ParamValue + '" where ParamName = "' + p.ParamName + '"'
            console.log(sql)
            let rs = await dbs.execute(sql);
        })
        
        res.json(result)
    });
};
