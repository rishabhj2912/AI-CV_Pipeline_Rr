const express = require("express");
const path = require("path")
const multer = require("multer")
const Minio = require('minio')
const ejs = require('ejs')
const mysql = require("mysql")
const jwt = require('jsonwebtoken')
const axios = require('axios')
const cookie_parser = require('cookie-parser')
const fs = require("fs");
const fs1 = require('fs-extra');
var rimraf = require("rimraf");
const crypto = require('crypto');
require('dotenv').config();

// const axios = require('axios')

const app = express();
var cors = require('cors');

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const port = process.env.UI_manager_port || 3000;

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




var minioClient = new Minio.Client({
  endPoint: process.env.MinIO_endpoint,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MinIO_accesskey,
  secretKey: process.env.MinIO_secretkey
});

//Encrypting text
function encrypt(text) {
  const secret = process.env.Secret_Key;
 
// Calling createHash method
const hash = crypto.createHash('sha256', secret)
                    
                   // updating data
                   .update(text)

                   // Encoding to be used
                   .digest('hex');
 
console.log(hash);
return hash;
}


app.listen(port, () => {
  console.log(`------>UI Manager started and Listening on port ${port}`);
});

app.set('view engine', 'ejs');
app.use(cookie_parser())
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.post('/heart', (req,res)=>{
  res.send({msg:"OK"});
});

app.get('/', (req,res)=>{
  if(req.cookies['access_token']){
    try{
      jwt.verify(req.cookies['access_token'], process.env.Token_enc_key);
    }catch{
      res.render('login.ejs', {msg: ""});
      return;
    }
    res.redirect('/home');  
    return;
  } 
  res.render('login.ejs', {msg: ""});
})

app.post("/", function(req,res){
  username = req.body.user.name;
  password = req.body.user.password;

  let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
  let query = mysql.format(select_query, ["dfs.users", "username", username]);

  mysqlconnection.query(query, (err,data)=>{
    if(err){
      console.log(err);
      return;
    }
    // console.log(data[0]);
    if (data.length == 0){
      console.log(1);
      res.render('login.ejs', {msg: "User doesn't exists. Try again!"});
    }else{ 
      // console.log(data[0]);
      // console.log(data[0].pass);
      hashed_pass = encrypt(password)
      // console.log(hashed_pass)
      // console.log(data[0].pass)
      if(hashed_pass == data[0].pass){
        // set cookie
        console.log(2);
        var token = jwt.sign({username : username, userid:data[0].user_id}, process.env.Token_enc_key, {expiresIn : 86400});
        console.log(token);
        
        res
        .status(200)
        .cookie("access_token" , token, {
          httpOnly:true,
        })
        .redirect('/home');
        // .send("Logged In Succesfully.");
        // .render('index.ejs');
      }else{
        console.log(3);
        res
        .status(200)
        .render('login.ejs', {msg: "Wrong password. Try again!"})
      }
    }
  });
})


app.get('/signup', (req,res)=>{
  res.render('signup.ejs', {msg: ""});
});


app.post("/signup", function(req,res){
  username = req.body.user.name;
  password = req.body.user.password;
  role = req.body.user.role;
  confirm_password = req.body.user.cpassword;
  
  console.log(req.body.user)

  if(password!=confirm_password){
    console.log(1)
    res.render('signup.ejs', {msg: "Password Not matched"});
    return;
  }
    let r=0;
    if(role=="Admin")r=1;
    else r=2;

    AES_encrypted_hash = encrypt(password)
    let insert_query = 'INSERT INTO dfs.users (username,pass,role) VALUES (?,?,?)';
    let query = mysql.format(insert_query, [username,AES_encrypted_hash,r]);
    console.log(query);

    mysqlconnection.query(query, (err,data)=>{
      if(err){
        console.log(err);
        res.render('signup.ejs', {msg: "User Name already exists. Try again !!"});
      }

      let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
      let query = mysql.format(select_query, ["dfs.users", "username", username]);

      mysqlconnection.query(query, (err,data)=>{
        if(err){
          console.log(err);
          return;
        }

      var token = jwt.sign({username : username, userid:data[0].user_id}, process.env.Token_enc_key, {expiresIn : 86400});
        console.log(token);
        
        res
        .status(200)
        .cookie("access_token" , token, {
          httpOnly:true,
        })
        .redirect('/home');
      });
      return;

    });
    
})

app.get('/logout', (req,res)=>{
  res.clearCookie('access_token');
  res.redirect("/")
});



app.get("/home", (req, res) => {
  console.log(req.cookies['access_token']);
  if(!req.cookies['access_token']){
    console.log("Cookie not found.")
    res.redirect('/');
  }else{
    // console.log(req.cookies['access_token']);
    try{
      decoded = jwt.verify(req.cookies['access_token'], process.env.Token_enc_key);
    }catch(err){
      res.redirect('/');
    } 
    console.log(decoded.username);

    // Fetch History
    let hist_query = 'SELECT ?? FROM ?? WHERE ?? = ? GROUP BY ??'
    let pipeline_query = mysql.format( hist_query, [ "pipeline_name", "dfs.operation", "user_id", decoded.userid, "id" ] );
    console.log(pipeline_query);

    mysqlconnection.query(pipeline_query, (err,pipeline_data)=>{
      if(err){
        console.log(err);
        return;
      }
      else{
        console.log( pipeline_data );

        let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
        let query = mysql.format(select_query, ["dfs.users", "username", decoded.username]);

        mysqlconnection.query(query, (err,data)=>{
          if(err){
            console.log(err);
            return;
          }
          // console.log(data[0]);
          if (data.length == 1){
            console.log(data);
            console.log(data[0].role);

            let comp_select_query = 'SELECT * FROM ??';
            let component_query = mysql.format( comp_select_query, ["dfs.components"]);
            let user_role = data[0].role;


            mysqlconnection.query(component_query, (err,data)=>{
              if(err){
                console.log(err);
                return;
              }

              let component_data = []

              for (let i = 1; i < data.length; i++) {
                // text += "The number is " + i + "<br>";
                let temp = [
                  data[i].id, //cid
                  data[i].name, //cname
                  data[i].description //cdesc
                ]
                component_data.push(temp);
              }
              console.log(component_data);
              if( user_role == 1 ){
                const obj = {
                  flag:"1",
                  cdata:component_data
                };
                // res.render('index.ejs', {obj});
                var multiObj = [{flag:"1", cdata: component_data, history: pipeline_data, user_name: decoded.username }];
                res.render('index.ejs', { mobj: multiObj } );
              }
              else{
                const obj = {
                  flag:"0",
                  cdata:component_data
                };
                // res.render('index.ejs', {obj});
                var multiObj = [{flag:"0", cdata: component_data, history: pipeline_data, user_name: decoded.username }];
                res.render('index.ejs', { mobj: multiObj } );
                //res.render('index.ejs', data: {flag:"0", cdata: component_data});
              }
            });


          }else{ 
            res.redirect('/')
          }
        });

      }
    });
    

    // let comp_query = 'SELECT * FROM ?? ';
    // let comp_ret_query = mysql.formal( comp_query, [ "components" ] );
  }
  // res.redirect('/');
});


app.post("/upload", multer({storage: multer.memoryStorage()}).single("mypic"),function (req, res, next) {
  console.log(req.file);
  console.log(req.body);
  try{
    decoded = jwt.verify(req.cookies['access_token'], process.env.Token_enc_key);
  }catch(err){
    res.redirect('/');
  } 
  console.log(decoded);
  let query = 'SELECT * FROM dfs.operation ORDER BY id DESC';
  mysqlconnection.query(query, (err,data)=>{
    if(err){
      console.log(err);
      res.send("Error uploading image.");
    }
    console.log(data[0]);
    var oid = data[0].id+1;
    var uid = decoded.userid;
    var imgpath = String(oid) + '/' + req.file.originalname;
    let insert_query = 'INSERT INTO dfs.operation(id,user_id,component_id,step,input,output,pipeline_name)VALUES(?,?,0,0,?,?,?)';
    insert_query = mysql.format(insert_query, [oid,uid,imgpath,imgpath,req.body.pname]);
    console.log(insert_query);
    mysqlconnection.query(insert_query, (err,data)=>{
      if(err){
        console.log(err);
        res.send("Error uploading image");
      }
      minioClient.putObject(process.env.MinIO_img_Bucket, imgpath, req.file.buffer, function(err, etag) {
        if (err) return console.log(err);
        res.redirect('/home#toolbar');
      
        // popup.alert('Your File Uploaded');
        console.log('File uploaded successfully.');
        console.log(etag);
      });
    });
    
  });
  
});

app.post("/compUpload", multer({storage: multer.memoryStorage()}).single("inputFile"),function (req, res, next) {
  console.log("Comp Upload Req:");
  console.log( req.body.cname );
  console.log( req.body.description );    
  

  let comp_name = req.body.cname;
  let comp_desc = req.body.description;
  
  minioClient.putObject(process.env.MinIO_comp_Bucket, req.file.originalname, req.file.buffer, function(err, etag) {
    if (err) return console.log(err);
    res.redirect('/home');
  
    console.log("=============================================")    
    // popup.alert('Your File Uploaded');
    console.log('Component Zip File uploaded successfully.');

    if(!req.cookies['access_token']){
      console.log("Cookie not found.")
      res.redirect('/');
    }else{
      // console.log(req.cookies['access_token']);
      try{
        decoded = jwt.verify(req.cookies['access_token'], process.env.Token_enc_key);
      }catch(err){
        res.redirect('/');
      } 
      console.log("USERNAME:");
      console.log(decoded.username);
    
      console.log("FILENAME:");
      console.log( req.file.originalname )

      let select_query = 'SELECT * FROM ?? WHERE ?? = ?';
      let uid_query = mysql.format(select_query, ["dfs.users", "username", decoded.username]);

      mysqlconnection.query(uid_query, (err,data)=>{
        if(err){
          console.log(err);
          return;
        }
        // console.log(data[0]);
        if (data.length == 1){
          console.log("user_id");
          console.log(data[0].user_id);
          let uid = data[0].user_id;

          let url_temp = "url";
          let insert_query = 'INSERT INTO ?? ( name, url, user_id, description, object_name ) VALUES( ?, ?, ?, ?, ? )';
          let comp_query = mysql.format(insert_query, ["dfs.components", comp_name, url_temp, uid, comp_desc, req.file.originalname ]);

          console.log( "COMP QUERY:" )
          console.log( comp_query );

          mysqlconnection.query( comp_query, (err,data)=>{
            if(err){
              console.log(err);
              return;
            }
            // console.log(data[0]);
            console.log( "Component updated in Database successfully !!" );


            // Sending data to node manager =========================================
            sendData = {
              "object_name": req.file.originalname,
              "c_name" : comp_name,
              "c_desc" : comp_desc,
              "user_id": uid
            }
      
            axios.post(process.env.Node_manager_url, sendData)
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });


            // SEND data to index.js ============================================
            let select_query2 = 'SELECT * FROM ?? WHERE ?? = ?';
            let cid_query = mysql.format(select_query, ["dfs.components", "name", comp_name]);
            mysqlconnection.query(cid_query, (err,data)=>{
              if(err){
                console.log(err);
                return;
              }
              console.log( "CID: " )
              console.log( data[0].id );
              //res.render('index.ejs', {flag:"1"});
              res.render('/home');
            });
            

          });

        }else{ 
          res.redirect('/')
        }
      });
 
    }
    
  });
})



app.post("/postjson", function (req, res) {
  try{
    decoded = jwt.verify(req.cookies['access_token'], process.env.Token_enc_key);
  }catch(err){
    res.redirect('/');
  } 
  console.log(decoded);
  let query = 'SELECT * FROM dfs.operation WHERE user_id = ? ORDER BY id DESC';
  query = mysql.format(query, [decoded.userid]);
  console.log(query);
  mysqlconnection.query(query, (err,data)=>{
    if(err){
      console.log(err);
      //res.send("Error sending pipeline.");
    }
    console.log(req.body);
    var imgpath = String(data[0].id) + '/' + req.body.image;
    console.log(data[0]);
    sendData = {
      oid : data[0].id,
      pipeline_name: data[0].pipeline_name,
      user_id: decoded.userid,
      imgpath: imgpath,
      pipeline: req.body.items
    };
    axios.post(process.env.Scheduler_url,sendData)
    .then(resp => {
      console.log("response recieved");
      // print(res);
      
      // res.redirect(`/viewResult/?name=${data[0].pipeline_name}`);
      res.send({msg:"Pipeline executed sucessfully"});
    })
    .catch(err => console.log(err));
  });

  // res.send({msg:"Hello"});
});


app.get("/viewResult", (req, res) => {
    //res.render('result.ejs');
    // console.log(req.query.name);
    // console.log("Current directory:", __dirname);

    console.log("======================== /viewResult ==========================");

    try{
      decoded = jwt.verify(req.cookies['access_token'], process.env.Token_enc_key);
    }catch(err){
      res.redirect('/');
    } 
    // console.log(decoded.userid);

    let pipeline_name = req.query.name;

    let get_op_id = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?';
    get_op_id = mysql.format( get_op_id, ["id", "dfs.operation", "pipeline_name", pipeline_name, "user_id", decoded.userid] );

    mysqlconnection.query( get_op_id, (err, op_data)=>{
      if(err){
        console.log("======================== get operation id from pipeline name error ==========================");
        console.log(err);
        res.send("Error sending component name.");
      }
      // console.log( op_data[0].id );


      
      let op_id = op_data[0].id;
      let query = 'SELECT * FROM dfs.operation WHERE id = ? ORDER BY step';
      query = mysql.format(query, [op_id]);
      // console.log(query);

      // create dir on local system
      const path = "./public/display/" + op_id;
    
      fs.access(path, (error) => {
        if (error) {
          fs.mkdir(path, (err) => {
            if (err) {
              console.log("======================= Error Creating Directory.=============================");
              console.log(err);
            } 
            else {
              console.log(">> New Directory created successfully !!");


              let send_data = [];
              mysqlconnection.query(query, (err,data)=>{
                if(err){

                  console.log(err);
                  res.send("Error sending operation.");
                }
                console.log( data );
                
                for(var i = 0; i < data.length ; i++){

                  let cname_query = 'SELECT name FROM dfs.components WHERE id = ?';
                  cname_query = mysql.format( cname_query, [ data[i].component_id ] );
                  
                  let oid = data[i].id;
                  let step = data[i].step;
                  let image_name = data[i].output;

                  mysqlconnection.query( cname_query, (err,data1)=>{
                    if(err){
                      console.log(err);
                      res.send("Error sending component name.");
                    }
                    //console.log( data1[0].name );
                    //console.log( data[i].step );

                    let image_path = '/display/' + image_name;
                    let cur_data = [
                      oid, // operation id
                      step, // step
                      image_path, // image name
                      data1[0].name // component name
                    ]
                    send_data.push( cur_data );

                    let local_path = __dirname + '/public' + image_path;
                    // download files from mino to local storage ===============================
                    minioClient.fGetObject( process.env.MinIO_img_Bucket , image_name, local_path, function(err) {
                      if (err) {
                          console.log("Error downloading");
                          return console.log(err);
                      }
                          console.log('==============success in file download');
                      })

                  });
                }
                
                setTimeout(function temp(){
                  console.log( send_data );
                  // console.log( send_data[0][2] );
      
                  let old_path = './' + op_id;
                  let new_path = './public/display/' + op_id + '/';
                  fs1.move(old_path, new_path, err => {
                    if(err) return console.error(err);
                    console.log('===================== success in move file!');
                  });
      
                  console.log("========== Data Send to front end =============");
                  res.render('result.ejs', { oper : send_data } );
                }, 4000);

              });
            }
          });
        } 
        else {
          // console.log("Given Directory already exists !!");
          let delete_path = './public/display/' + op_id;
          rimraf( delete_path , function () { console.log("done"); });

          let send_data = []
          mysqlconnection.query(query, (err,data)=>{
            if(err){
              console.log(err);
              res.send("Error sending operation.");
            }
            console.log( data );
            
            for(var i = 0; i < data.length ; i++){

              let cname_query = 'SELECT name FROM dfs.components WHERE id = ?';
              cname_query = mysql.format( cname_query, [ data[i].component_id ] );
              
              let oid = data[i].id;
              let step = data[i].step;
              let image_name = data[i].output;

              mysqlconnection.query( cname_query, (err,data1)=>{
                if(err){
                  console.log(err);
                  res.send("Error sending component name."); 
                }
                //console.log( data1[0].name );
                //console.log( data[i].step );

                let image_path = '/display/' + image_name;
                let cur_data = [
                  oid, // operation id
                  step, // step
                  image_path, // image name
                  data1[0].name // component name
                ]
                send_data.push( cur_data );

                //let local_path = '/temp' + image_path;
                
                // download files from mino to local storage ===============================
                let local_path = __dirname + '/public' + image_path;
                minioClient.fGetObject( process.env.MinIO_img_Bucket , image_name, local_path, function(err) {
                  if (err) {
                      return console.log(err);
                  }
                      console.log('success in file download');
                })


              });
            }
            
            setTimeout(function temp(){
              console.log( send_data );
              // console.log( send_data[0][2] );

              let old_path = './' + op_id;
              let new_path = './public/display/' + op_id + '/';
              fs1.move(old_path, new_path, err => {
                if(err) return console.error(err);
                console.log('success!');
              });

              console.log("========== Data Send to front end =============");
              res.render('result.ejs', { oper : send_data } );
            }, 4000);


          });
        }
      }); 


    });

    
});