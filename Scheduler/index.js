const express = require("express");
const app = express();
const Minio = require('minio')
const axios = require('axios')
const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));
require('dotenv').config();

app.use(express.json())
const port = process.env.Scheduler_port || 8001;

//SQL Connection
var mysql = require('mysql');
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

// Resolving CORS Error
var cors = require('cors');
// const { default: fetch } = require("node-fetch");

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.listen(port, () => {
  console.log(`------>Scheduler started and Listening on port ${port}`);
});

app.post('/heart', (req,res)=>{
  res.send({msg:"OK"});
});

app.get('/', (req,res)=>{
    res.send("Hello World.")
});

app.post("/createPipeline", async function (req, res) {
        
  // console.log(req.body);
  // console.log(req.headers);
  console.log(req.body);
  var step = 1;
  var ip_path = req.body.imgpath;

  for(var comp of req.body.pipeline){
 
    let query = 'SELECT * FROM dfs.components WHERE name = ?';
    // console.log(comp['name']);
    
    query = mysql.format(query, [comp['name']]);
    console.log(query);
    async function func1(query) {
      const temp_value =  await new Promise((resolve, reject)=>{
        mysqlconnection.query(query, async function(err, data){
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          sendData = {
            file_name:ip_path,
            oid:req.body.oid,
            step:step
          };   

          console.log(data[0].url);
          console.log(sendData);

          temp=ip_path;
          ip_path = String(req.body.oid) + '/' + String(step) + '-op.jpg' ;

          async function func2(){
            const temp_value2 = await new Promise((resolve1, reject1)=>{
              axios.post(data[0].url, sendData)
              .then(function (response) {
                console.log(`Response from ${comp['name']} Recieved`);
                operation_query = "INSERT INTO dfs.operation(id,user_id,component_id,step,input,output,pipeline_name) VALUES (?,?,?,?,?,?,?)"
                operation_query = mysql.format(operation_query,[req.body.oid, req.body.user_id, data[0].id, step, temp, ip_path,req.body.pipeline_name]);
                console.log(operation_query);
                mysqlconnection.query(operation_query, (err,operation_data)=>{
                  if(err){
                    console.log(err);
                    res.send({msg:"Error"});
                    return;
                  }
                  // console.log(step," Completed")
                });
                resolve1('Request sent sucessfully');
              })
              .catch(function (error) {
                console.log(error);
                reject1('Error Sending request');
              });
            });
            // console.log(temp_value2);
          }
          var value1 = await func2();
          console.log(value1);
          step+=1;
          resolve(data);
        });
      });
    }
    await func1(query);
    console.log(comp['name']);
    
  }

  res.send({msg:"Hello"});
});


