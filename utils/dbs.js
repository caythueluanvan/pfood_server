const mysql = require('mysql');
const config = require('./config.js');

const Service = {
  
    getConn: () => {
      let conn = null;
        try {
           conn = mysql.createConnection({
                host     : config.host,
                user     : config.user,
                password : config.password,
                database : config.database
              });
              conn.connect();
        }
        catch (err) {
         
        }
      return conn
    },
    closeConn: conn => {
      if (conn) {
        try {
           conn.end();
        }
        catch (err) {
          console.log(err)
        }
      }
    },
    execute: (sql, bind) => {
      return new Promise(async (resolve, reject) => {
        let conn
        try 
        {
          conn = Service.getConn();
          
          conn.query(sql, bind, function (error, results) {
            if (error) reject(error);
            resolve(results)
          });
        }
        catch (err) {
          reject(err)
        }
        finally {
          Service.closeConn(conn)
        }
      })
    }

  }
  module.exports = Service