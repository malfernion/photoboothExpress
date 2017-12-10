#!/bin/bash

INSTALL_LOCATION=installLocation

node $INSTALL_LOCATION/../app.js > serverLog.out &
google-chrome --user-data-dir=$(mktemp -d) --kiosk http://localhost:8443/
