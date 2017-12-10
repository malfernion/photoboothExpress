#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

read -p "Would you like photoboothExpress to place a script that starts the server and opens the default browser to the photobooth app on the desktop?" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  sed "s|scriptLocation|$DIR|g" $DIR/startPhotobooth.sh > $DIR/configuredStartPhotobooth.sh
  sed "s|scriptLocation|$DIR|g" $DIR/photoboothExpress.desktop > ~/Desktop/photoboothExpress.desktop
  chmod +x $DIR/configuredStartPhotobooth.sh
  chmod +x ~/Desktop/photoboothExpress.desktop
fi
