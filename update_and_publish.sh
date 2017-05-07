#!/bin/bash

echo "1 - updating examples."
sh update.sh

echo "2 - pushing changes to github."
git add -A
COMMIT_MESSAGE = "[MAGE BUILD] building mage"
git commit -m $COMMIT_MESSAGE
git push origin master

echo "3 - creating new version with npm."
VERSION=$(npm version patch)
VERSION=$(echo $VERSION | cut -c 2-)

echo "4 - creating new tag opn github"
git tag $VERSION && git push --tags

echo "5 - publising mage engine to npm."
npm login
npm publish

