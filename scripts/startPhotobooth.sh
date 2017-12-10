#!/bin/bash

SCRIPT_LOCATION=scriptLocation

node $SCRIPT_LOCATION/../app.js > serverLog.out &
google-chrome --user-data-dir=$(mktemp -d) --kiosk http://localhost:8443/
