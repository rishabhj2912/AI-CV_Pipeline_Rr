const express = require("express");
const mysql = require("mysql")
const axios = require('axios')
require('dotenv').config();


const app = express();
var cors = require('cors');
app.use(express.json())

var mysqlconnection = mysql.createConnection({
    host:process.env.DB_host,
    user:process.env.DB_user,
    password:process.env.DB_password,
    port:process.env.DB_port,
    timeout:6000
});

mysqlconnection.connect(function(err){
    if(err){
        console.log('Database connection failed:' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

url_list = ["heartbeat.py",process.env.UI_manager_url,process.env.Scheduler_url]

sql_query = "SELECT url,object_name FROM dfs.components";
mysqlconnection.query(sql_query, async (err,comps)=>{
  if(err){ 
    console.log(err);
    return;
  }
  console.log(comps);
  for(var i=1; i<comps.length; i++){
    url_list.push(  comps[i].url, "../Components/" + comps[i].object_name.split('.')[0]);
  }
  console.log(url_list);
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python3',url_list);
  pythonProcess.stdout.pipe(process.stdout);
});






