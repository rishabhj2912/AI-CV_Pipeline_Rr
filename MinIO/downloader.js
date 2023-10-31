var Minio = require('minio')

// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'EitPADwoAUvkzhs6',
    secretKey: 'g82ahUIxSAhtIJeCoLWTV1YrONFpjTop'
});
var size = 0
minioClient.fGetObject('uploads', 'reducer.py', 'downloaded_reducer.py', function(err) {
if (err) {
    return console.log(err);
}
    console.log('success');
})