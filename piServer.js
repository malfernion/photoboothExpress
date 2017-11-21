var express = require('express');
var path = require('path');
var ref = require('ref');
var fs = require('fs');
var gphoto = require('./node_modules/gphoto2_ffi/index.js');
var gphoto_get_config = require("./node_modules/gphoto2_ffi/get_config");
var app = express();

var port = 8443;
var context, camera;
var destination = './images/';
var fileName = 'wedding_photo_';
var fileExtension = '.png';
var images = [];
var imageIndex = 0;

app.use(express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, destination)));
app.use('/paper-ripple', express.static(path.join(__dirname, '/node_modules/paper-ripple/dist')));

app.get("/", function(req, res) {
   res.sendFile('piBooth.html', {root : __dirname});
});

app.get("/slideshow", function(req, res) {
  res.sendFile('piShow.html', {root : __dirname});
});

app.get("/nextPicture", function(req, res) {
  if(images.length > 0) {
    res.send(path.join(destination, images[imageIndex]));
    imageIndex++;
    if(imageIndex === images.length) {
      imageIndex = 0;
    }
  } else {
    res.status(404).send('No images found');
  }
});

app.post("/capture", function(req, res) {
  console.log('received capture request, initiating capture');
  var result = use_camera();
  if(result !== 0) {
    res.send(500);
  }
  res.send(200);
});

var init = function() {
  context = gphoto.gp_context_new();
  camera = gphoto.NewInitCamera(context);

  fs.readdir(destination, (err, files) => {
    images = files;
  });

  app.listen(port, function() {
    console.log("Listening on " + port);
  });
}

init();


var use_camera = function() {
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
