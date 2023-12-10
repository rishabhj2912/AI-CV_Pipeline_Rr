const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT;
console.log(port);

// const host = "127.0.0.1"
app.use(express.json())
app.use(express.urlencoded({extend:true}))

app.post('/heart', (req,res)=>{
  res.send({msg:"OK"});
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/run', (req,res) => {
  console.log(req.body)
  var ip_path = req.body.file_name  
  console.log(ip_path);
  var op_path = String(req.body.oid) + '/' + String(req.body.step) + '-op.jpg' 
  console.log(op_path); 
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python3',["app/utility.py", ip_path, op_path]);
  pythonProcess.stdout.pipe(process.stdout);

  res.send('Task Completed')
});

app.listen(port, () => {
  console.log(`------>Example app listening on port ${port}`)
})
