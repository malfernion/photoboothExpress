#!/bin/bash

SCRIPT_LOCATION=/home/dave/workspace/photoboothExpress/scripts

node $SCRIPT_LOCATION/../app.js > serverLog.out &
google-chrome --user-data-dir=$(mktemp -d) --kiosk http://localhost:8443/
