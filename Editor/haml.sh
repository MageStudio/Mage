#!/bin/bash

#building index
haml index.haml index.html

#listing every template in /views folder
for entry in "views"/*.haml
do
  if [ -f "$entry" ];then
    view=(${entry//.haml/ })
    haml ${view[0]}.haml ${view[0]}.html
  fi
done
