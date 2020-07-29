const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');

router.get('/recommend/:customerid', async function (req, res) {
    let rs = await dbs.execute(`select r.CustomerID customer_id, si.ItemID product_id, max(r.Rate) rating from rate r, sourceofitems si where r.SourceOfItemsID = si.SourceOfItemsID group by r.CustomerID, r.sourceofitemsid order by r.CustomerID, si.ItemID`, []);
    let userToRecommend = await dbs.execute(`SELECT distinct CustomerID customer_id FROM rate where CustomerID = ? `, [req.params.customerid]);
    let rsRecommend = [];    
    if (userToRecommend.length) {
        var groups = {};
        for (var i = 0; i < rs.length; i++) {
            var groupName = rs[i].customer_id;
            if (!groups[groupName]) {
                groups[groupName] = {};
            }
            // groups[groupName].push({[rs[i].product_id]: rs[i].rating})
            groups[groupName][rs[i].product_id] = rs[i].rating
        }
        let recommend = [];
        // userToRecommend.forEach(element => {
            item = recommendation_eng(groups, req.params.customerid, euclidean_score);
            
            item[0].forEach(i => {
                recommend.push({ item: i.items, val: Math.round(i.val) })
            })
        // });
        // recommend.sort((a, b) => (a.val < b.val) ? 1 : -1);
        let bind = [];
        recommend.forEach(e => {
            bind.push(`${e.item}`)
        });
        if(bind.length){
            rsRecommend = await dbs.execute(`select it.ItemName, s.Summary,i.defaultprice, s.Price, s.SourceOfItemsID, i.id, s.ItemID, i.ItemImage Image, i.Description, (select prm.Promotiontypeid from promotion prm where prm.partnerID = i.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typeid, (select prmt.PromotiontypeName from promotion prm, promotiontype prmt where prm.Promotiontypeid = prmt.PromotionTypeID and prm.partnerID = i.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as typename, (select prm.Promotionconditionid from promotion prm where prm.partnerID = i.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionid, (select prmc.ConditionName from promotion prm, promotioncondition prmc where prm.Promotionconditionid = prmc.ConditionID and prm.partnerID = i.partnerID and prm.StartTime <= now() and prm.EndTime >= now()) as conditionname from sourceofitems s, itempartner i, items it  where s.ItemID = i.id and i.itemid = it.ItemID and i.id in ( ? ) and s.EndTime >= now() limit 5  `, [bind]);  
        }else {
            rsRecommend= []
            // rsRecommend = await dbs.execute(`select it.ItemName, s.Summary, s.Price, s.SourceOfItemsID, i.id, s.ItemID, i.ItemImage Image, i.defaultprice, i.Description  from sourceofitems s, itempartner i, items it  where s.ItemID = i.id and i.itemid = it.ItemID and s.EndTime >= now() limit 5  `, []);
        }
       
    } else {
        rsRecommend= []
        // rsRecommend = await dbs.execute(`select it.ItemName, s.Summary, s.Price, s.SourceOfItemsID, i.id, s.ItemID, i.ItemImage Image, i.defaultprice, i.Description  from sourceofitems s, itempartner i, items it  where s.ItemID = i.id and i.itemid = it.ItemID and s.EndTime >= now() limit 5  `, []);
    }
    res.json(rsRecommend);
});

var euclidean_score = function (dataset, p1, p2) {

    var existp1p2 = {};
    for (var key in dataset[p1]) {
        if (key in dataset[p2]) {
            existp1p2[key] = 1
        }
        if (len(existp1p2) == 0) return 0;//check if it has a data
        var sum_of_euclidean_dist = [];//store the  euclidean distance


        for (item in dataset[p1]) {
            if (item in dataset[p2]) {
                sum_of_euclidean_dist.push(Math.pow(dataset[p1][item] - dataset[p2][item], 2));
            }
        }
        var sum = 0;
        for (var i = 0; i < sum_of_euclidean_dist.length; i++) {
            sum += sum_of_euclidean_dist[i];
        }
        var sum_sqrt = 1 / (1 + Math.sqrt(sum));
        return sum_sqrt;
    }
}

var len = function (obj) {
    var len = 0;
    for (var i in obj) {
        len++
    }
    return len;
}

var similar_user = function (dataset, person, num_user, distance) {
    var scores = [];
    for (var others in dataset) {
        if (others != person && typeof (dataset[others]) != "function") {
            var val = distance(dataset, person, others)
            var p = others
            scores.push({ val: val, p: p });
        }
    }
    scores.sort(function (a, b) {
        return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
    });
    var score = [];
    for (var i = 0; i < num_user; i++) {
        score.push(scores[i]);
    }
    return score;

}

var recommendation_eng = function (dataset, person, distance) {

    var totals = {
        //you can avoid creating a setter function
        //like this in the object you found them
        //since it just check if the object has the property if not create
        //and add the value to it.
        //and  because of this setter that why a function property
        // is created in the dataset, when we transform them.
        setDefault: function (props, value) {
            if (!this[props]) {
                this[props] = 0;
            }
            this[props] += value;
        }
    },
        simsum = {
            setDefault: function (props, value) {
                if (!this[props]) {
                    this[props] = 0;
                }

                this[props] += value;
            }
        },
        rank_lst = [];
    for (var other in dataset) {
        if (other === person) continue;
        var similar = distance(dataset, person, other);

        if (similar <= 0) continue;
        for (var item in dataset[other]) {
            if (!(item in dataset[person]) || (dataset[person][item] == 0)) {
                //the setter help to make this look nice.
                totals.setDefault(item, dataset[other][item] * similar);
                simsum.setDefault(item, similar);


            }

        }


    }

    for (var item in totals) {
        //this what the setter function does
        //so we have to find a way to avoid the function in the object     
        if (typeof totals[item] != "function") {

            var val = totals[item] / simsum[item];
            rank_lst.push({ val: val, items: item });
        }
    }
    rank_lst.sort(function (a, b) {
        return b.val < a.val ? -1 : b.val > a.val ?
            1 : b.val >= a.val ? 0 : NaN;
    });
    var recommend = [];
    for (var i in rank_lst) {
        recommend.push(rank_lst[i].items);
    }
    return [rank_lst, recommend];
}

module.exports = router;
