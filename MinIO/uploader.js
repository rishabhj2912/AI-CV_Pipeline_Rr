var Minio = require('minio');
// console.log("1");
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
// console.log("1");

// File that needs to be uploaded.http://127.0.0.1:9090/browser/uploads
var file = 'reducer.py';
// console.log("1");

// Make a bucket called europetrip.
// minioClient.makeBucket('CompUpload', 'us-east-1', function(err) {
//     if (err) return console.log(err)

//     console.log('Bucket created successfully in "us-east-1".')
// console.log("1");

var metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': 1234,
    'example': 5678
};
// Using fPutObject API upload your file to the bucket europetrip.
// console.log("1");

minioClient.fPutObject('uploads', 'reducer.py', file, metaData, function(err, etag) {
    if (err) return console.log(err)
    console.log('File uploaded successfully.')
});
// });
