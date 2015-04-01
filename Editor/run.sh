#!/bin/bash

#building templates
./haml.sh

#calling simple http server
python -m SimpleHTTPServer
