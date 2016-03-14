"use strict";

let http = require('http')
let request = require('request')
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port
let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

console.log(destinationUrl)


http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
    }
    req.pipe(res)
    process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(logStream, {end: false})
}).listen(8000)

http.createServer((req, res) => {
    console.log(`Proxying request to: ${destinationUrl + req.url}`)
    let options = {
        headers: req.headers,
        url: `${destinationUrl}${req.url}`
    }
    console.log(destinationUrl)
    options.method = req.method
    let downstreamResponse = req.pipe(request(options))
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(process.stdout)
    downstreamResponse.pipe(res)

}).listen(8001)

