#!/bin/bash

# building everything
sh update.sh

# sending to github
git add -A
git commit -m '[MAGE BUILD] building mage'
git push origin master

# login in npm
npm login

# updating version
npm version patch

# publish this version
npm publish

