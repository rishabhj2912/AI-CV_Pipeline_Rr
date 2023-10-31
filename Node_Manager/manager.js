
const express = require("express");
const app = express();
const Minio = require('minio')
var mysql = require('mysql')
const fs = require('fs')
const decompress = require("decompress");
require('dotenv').config();

app.use(express.json())
var comp_port=8010

const port = process.env.Node_manager_port || 8086;
// My sql conection
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


// MinIO client creation
var minioClient = new Minio.Client({
  endPoint: process.env.MinIO_endpoint,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MinIO_accesskey,
  secretKey: process.env.MinIO_secretkey
});


sql_query = "SELECT object_name FROM dfs.components";
mysqlconnection.query(sql_query, async (err,comps)=>{
  if(err){ 
    console.log(err);
    return;
  }
  comp_list = ["app_runner.py","../UI_manager","../Scheduler"];
  // console.log(comps);
  for(var i=1; i<comps.length; i++){
    comp_list.push("../Components/" + comps[i].object_name.split('.')[0]);
  }
  console.log(comp_list); 
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python3',comp_list);
  pythonProcess.stdout.pipe(process.stdout);
});


app.post('/heart', (req,res)=>{
  res.send({msg:"OK"});
});

app.get('/redeploy/:port', (req,res)=>{
  console.log(req.params["port"]);
  const spawn = require('child_process').spawn;
        spawn('npm', ['start'], {
          cwd: "../Scheduler/",        // <--- 
          shell: true,
          stdio: 'inherit'
        });

  res.send("Hi");
});

app.get('/', (req,res)=>{
  res.send("Hello World.")
});

app.post('/deploynode', (req,res)=>{
  console.log(req.body);
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python3',req.body.path);
  pythonProcess.stdout.pipe(process.stdout);

})

app.post('/deploy', (req,res)=>{
    // Json recieved from UI manager
    console.log(req.body);
    temp = req.body;

    component_file_name = temp['object_name']
    component_name = temp['c_name']
    component_desc = temp['c_desc']
    user_id = temp['user_id']

    comp_folder = component_file_name.split(".");

    var size = 0

    // Component Zip file downloaded from minio
    minioClient.fGetObject('comp-upload', component_file_name, component_file_name, function(err) {
    if (err) {
      return console.log(err);
    }
      console.log('success');
    })


    // Index Zip file downloaded from minio
    minioClient.fGetObject('comp-upload', "index.zip", "index.zip", function(err) {
      if (err) {
        return console.log(err);
      }
        console.log('success');
      })

    
    let destination = "../Components/"

    //Decompressing the zip files
    setTimeout(function() {
        decompress(component_file_name, destination)
        .then((files) => {
          console.log(files);
        })
        .catch((error) => {
          console.log(error);
        });    

        let temp = destination.concat(comp_folder[0])
        decompress("index.zip", temp)
        .then((files) => {
          console.log(files);
        })
        .catch((error) => {
          console.log(error);
        });  
        
      }, 3000);

      setTimeout(function() {
        let temp = destination.concat(comp_folder[0])
        fs.appendFile(temp+'/.env', 'PORT='+comp_port, function (err) {
          if (err) throw err;

          var select_query = 'SELECT max(dfs.components.id) as cid from dfs.components'
          mysqlconnection.query(select_query, (err,data)=>{
            if(err){
              console.log(err);
              return;
            }
            console.log(data[0].cid)
            url = 'http://127.0.0.1:'+comp_port+'/run';
            var update_query = 'UPDATE dfs.components SET url = ? WHERE id = ?';
            update_query = mysql.format(update_query, [url, data[0].cid ]);
            console.log(update_query);
            mysqlconnection.query(update_query, (err,data1)=>{
              if(err){
                console.log(err);
                return;
              }
            });

            
          });

          // data[0].id


         
          
          console.log('Saved!');
        });
      },6000);

    // npm install command running inside the component  
    setTimeout(function() {  
      let temp = destination.concat(comp_folder[0])
      const spawn = require('child_process').spawn;

        spawn('npm', ['install'], {
          cwd: temp,        // <--- 
          shell: true,
          stdio: 'inherit'
        });

      }, 9000);    
    
    setTimeout(function() {
      temp = destination.concat(comp_folder[0])
      comp_port++;
      // runner_dest = temp.concat('/index.js')
      const spawn = require('child_process').spawn;

        spawn('node', ['index.js'], {
          cwd: temp,        // <--- 
          shell: true,
          stdio: 'inherit'
        });
    }, 25000);



    res.send("Hello World.")

});



app.listen(port, () => {
  console.log("------>Node Manager started and Listening on port 8085");
});