#!/bin/bash

# building everything
sh update.sh

# login in npm
npm login

# updating version
npm version patch

# publish this version
npm publish

