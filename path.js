// Import the neccessary built-in modules and extra services
var path = require("path");
const configdata = require("./config");
const service = require("./method");
var url = require("url");

var fileName = path.basename(
  "D:MERN Stack courseNode & Express JSclassWork_11thFeb\\path.js"
);
var fileExtension = path.extname(
  "D:MERN Stack courseNode & Express JSclassWork_11thFeb\\path.js"
);
var join_path = path.join(
  "D:",
  "NODE & EXPRESS JS",
  "classWork_11thFeb",
  "path.js"
);
var directory = path.dirname(
  "D:MERN Stack courseNode & Express JSclassWork_11thFeb\\path.js"
);

// console.log(fileName); // Prints the filename
// console.log(fileExtension); // Prints the extension of the file
// console.log(`The absolute path of the file is : ${join_path}`);
// console.log(directory); //Prints the directory path of the file except the file itself
// console.log(configdata);
// console.log(service.add(10, 15));
// console.log(service.divide(10, 3));

var adr = "https://www.youtube.com/watch?v=ihcE3aLoAEo";
var url_data = url.parse(adr, true);
// console.log(url_data);
// console.log(`host name : ${url_data.hostname}`);
// console.log(`port : ${url_data.port}`);
// console.log(`path name : ${url_data.path}`);
// console.log(`search : ${url_data.search}`);
// console.log(`query is :${url_data.query.month}`);

//Event emitter
// let eventEmitter = require("events");
// let myEventEmitter = new eventEmitter();

// myEventEmitter.on("average", (a, b, c) => {
//   console.log(`The average of ${a}, ${b} and ${c} is ${(a + b + c) / 3}`);
// });

// myEventEmitter.emit("average", 2, 4, 3);

//express
let express = require("express");
let app = express();
// let path = require("path"); //path is already required above

app.get("/demo", function (req, res) {
  // res.send('<h1><font color="blue">Hello World!</font></h1>');
  // res.send("Hello world");
  res.sendFile(path.join(__dirname, "demo.html"));
});

// app.get("/contact", function (req, res) {
//   res.send('<h1><font color="red">Contact page!</font></h1>');
// });

var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
