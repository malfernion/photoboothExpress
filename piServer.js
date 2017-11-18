var express = require("express");
var app = express();

app.get("/", function(req, res) {
   res.sendfile('piBooth.html');
});

app.post("/capture", function(req, res) {
   res.send("OK");
});

var port = 8443;
app.listen(port, function() {
  console.log("Listening on " + port);
});
