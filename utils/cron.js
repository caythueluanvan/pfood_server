'use strict'
const dbs = require('./dbs')
var async = require("async");
const genSourceOfItem = async () => {
    try {
        const rsSchedule = await dbs.execute('select s.item_id, s.timefrom, s.timeto, s.price, s.amount from scheduleitem s, itempartner i where dayofweek =? and i.id = s.item_id and i.statusid = 1', [new Date().getDay()])

        let sourceOfItemId = await dbs.getNextID('sourceofitems', 'sourceofitemsid');
        let bind = [];
        async.forEachOf(rsSchedule, async (value, key) => {
            let startTime = new Date();
            startTime.setHours(value.timefrom.split(':')[0]);
            startTime.setMinutes(value.timefrom.split(':')[1]);
            startTime.setSeconds(value.timefrom.split(':')[2]);
            let endTime = new Date();
            endTime.setHours(value.timeto.split(':')[0]);
            endTime.setMinutes(value.timeto.split(':')[1]);
            endTime.setSeconds(value.timeto.split(':')[2]);
            let id = 'sourceofitems' + ((parseInt(sourceOfItemId.replace('sourceofitems', '')) + key).toString().padStart(20 - 'sourceofitems'.length, '0'));
            bind.push([id, value.item_id, value.amount, value.price, startTime, endTime])
        }, async err => {
              if (err) console.log(err);
              await dbs.execute(`insert into sourceofitems(sourceofitemsid, itemid, summary, price, starttime, endtime) values ?`, [bind]);
        });
    }
    catch (err) {
        console.log(err)
    }
}

module.exports.genSourceOfItem = genSourceOfItem