var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs");


/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var filename = "chats.json";
var data;
fs.readFile(filename, function (err, tempData) {
  data = JSON.parse(tempData);
});

var getClasses = function(url){
  var subUrl = url.split('/')[2];

  return JSON.stringify(data);
};

var postRequest = function(request, response){
  request.on('data',function(buffer){
    data.results.push(JSON.parse(buffer.toString()));
    fs.writeFile(filename, JSON.stringify(data), function (err) {})
  });
  return {
    statusCode: 201
  }
};


var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  request.url = request.url.split('?')[0];
  console.log("Serving request type " + request.method + " for url " + request.url);
  // request.on('data', function (buffer) {
  //   console.log(buffer.toString('utf-8'))
  // });



  var contentTypes = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript",
    '.map': "application/json",
    '.gif': "image/gif"
  };


  if (request.url === '/' && request.method === "GET") {
    request.url = '/index.html';
  }

  if(contentTypes.hasOwnProperty(path.extname(request.url))){
    var pathName = path.join(process.cwd(),'../client',request.url);
    var contentType = contentTypes[path.extname(request.url)];
    fs.readFile(pathName, function(err,file){
      if(err){
        console.log(err);
      }
      var headers = {};
      headers['Content-Type'] = contentType;
      response.writeHead(200, headers);
      response.end(file);
    });
    return;
  }

  var data = "";
  // GET / -> index.html
  // GET /log
  // GET /classes/messages
  // POST /send
  // GET /classes/room

  var getRoutes = {
    classes: getClasses,
    log: getClasses
  };

  var urlRoot = request.url.split('/')[1];


  if (request.method === "GET"){
    if (getRoutes.hasOwnProperty(urlRoot)) {
      var statusCode = 200;
      data = getRoutes[urlRoot](request.url);
    } else {
      var statusCode = 404;
    }
  } else if(request.method === "POST"){
    var statusCode = 201;
    postRequest(request, response);
  } else if(request.method === "OPTIONS"){
    var statusCode = 200;
  } else {
    var statusCode = 404;
  }

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(data);
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Allow": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.requestHandler = requestHandler;
