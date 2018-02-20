var express = require('express');
var path = require('path');
var ref = require('ref');
var fs = require('fs');
var ip = require('ip');
var gphoto = require('./node_modules/gphoto2_ffi/index.js');
var gphoto_get_config = require("./node_modules/gphoto2_ffi/get_config");
var app = express();

// try loading local config from config.json
var config;
try {
  config = require('./config.json');
} catch (e) {
  config = {};
}
var port = config.port ? config.port : 8443;
var destination = config.destination ? config.destination : './images/';
var fileName = config.fileName ? config.fileName : 'wedding_photo_';

// local variables
var configured = false;
var context, camera;
var fileExtension = '.jpg';
var images = [];
var imageIndex = 0;

app.use(express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, destination)));
app.use('/paper-ripple', express.static(path.join(__dirname, '/node_modules/paper-ripple/dist')));

var readDirectory = function() {
  // create and/or read image directory
  if (!fs.existsSync(destination)){
      fs.mkdirSync(destination);
  }
  fs.readdir(destination, (err, files) => {
    images = files;
  });
};

readDirectory();

// Initialisation routes
app.get("/", function(req, res) {
   res.status(200).sendFile('photoInit.html', {root : __dirname});
});

app.get('/init', function(req, res) {
  grabCamera().then(() => {
    configured = true;
    res.status(200).send();
  }, () => {
    res.status(503).send();
  });
});

app.get('/start', function(req, res) {
  if(configured) {
    app.get("/booth", function(req, res) {
       res.status(200).sendFile('photoBooth.html', {root : __dirname});
    });

    app.post("/capture", function(req, res) {
      console.log('received capture request, initiating capture');
      var result = use_camera();
      if(result !== 0) {
        res.status(500).send();
      }
      res.status(200).send();
    });

    res.status(200).send();
  }
});

// Slideshow routes
app.get("/slideshow", function(req, res) {
  res.status(200).sendFile('photoShow.html', {root : __dirname});
});

app.get("/nextPicture", function(req, res) {
  if(images.length > 0) {
    res.status(200).send(path.join(destination, images[imageIndex]));
    imageIndex++;
    if(imageIndex === images.length) {
      imageIndex = 0;
    }
  } else {
    res.status(404).send('No images found');
  }
});

// Start the server
app.listen(port, function() {
  console.log("Listening on " + ip.address() + ':' + port);
});

// initialise camera
var grabCamera = function() {
  console.log('grabbing camera');
  return new Promise((resolve, reject) => {
    try {
      context = gphoto.gp_context_new();
      camera = gphoto.NewInitCamera(context);
      console.log('grabbed camera');
      resolve();
    } catch (e) {
      console.log('screwed up grabbing camera');
      reject();
    }
  });
};

var use_camera = function() {
  console.log('using camera');
  var imageName = fileName + Date.now() + fileExtension;
  var dest_path = path.join(destination, imageName);

  var pathPtr = ref.alloc(gphoto.CameraFilePath);

  var res = gphoto.gp_camera_capture(camera, gphoto.GP_CAPTURE_IMAGE, pathPtr, context);
  if (res < 0) {
    console.log("Could not capture image:\n" + gphoto.gp_port_result_as_string(res));
    return (-1);
  }

  var path_folder = pathPtr.deref().folder.buffer.readCString(0);
  var path_name = pathPtr.deref().name.buffer.readCString(0);
  console.log("Photo temporarily saved in " + path_folder + path_name);

  var destPtr = ref.alloc(gphoto.CameraFile);
  if (gphoto.gp_file_new(destPtr) < 0)
    return -1;
  var dest = destPtr.deref();

  res = gphoto.gp_camera_file_get(camera, path_folder, path_name,
    gphoto.GP_FILE_TYPE_NORMAL, dest, context);
  if (res < 0) {
    console.log("Could not load image:\n" +
      gphoto.gp_port_result_as_string(res));
    return (-1);
  }

  res = gphoto.gp_file_save(dest, dest_path);
  if (res < 0) {
    console.log("Could not save image in " + dest_path + ":\n" +
      gphoto.gp_port_result_as_string(res));
    return (-1);
  }
  console.log("Image saved in " + dest_path);
  gphoto.gp_file_unref(dest);

  images.push(imageName);
  return 0;
};
