var Minio = require('minio')

// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: '10.8.0.31',
    port: 9000,
    useSSL: false,
    accessKey: 'MzsWV9nrzt0a4jDjdORY',
    secretKey: 'aRKv3GgGROmV7eU65JUNsrXxktZwAtEUOzGdn21W',
    api:"s3v1",
    path:"auto"
});
var size = 0
minioClient.fGetObject('uploads', 'reducer.py', 'downloaded_reducer.py', function(err) {
if (err) {
    return console.log(err);
}
    console.log('success');
})