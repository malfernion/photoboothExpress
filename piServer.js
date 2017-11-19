var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'assets')));
app.use('/paper-ripple', express.static(path.join(__dirname + '/node_modules/paper-ripple/dist')));

app.get("/", function(req, res) {
   res.sendFile('piBooth.html', {root : __dirname});
});

app.post("/capture", function(req, res) {
  console.log('received capture request, initiating capture')
  setTimeout(function() {
    console.log('capture completed');
    res.send("OK");
  }, 2000);
});

var port = 8443;
app.listen(port, function() {
  console.log("Listening on " + port);
});
