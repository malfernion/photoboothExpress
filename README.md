# photoboothExpress
A simple node server and web app for running a photo booth and viewing captured images
Whilst primarily intended for use with a raspberry pi with a GPIO mounted touchscreen,
this has been written so that it uses browser events to trigger photo capture, and therefore
could be used with any touchscreen device on the network.

Images are taken with usb connected cameras (covering simple point and shoots all the way up to
fancy DSLR's) driven by gphoto2 (http://www.gphoto.org/).
