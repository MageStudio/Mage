#!/bin/bash

grunt build --verbose

echo "\nnow updating examples\n"

for d in examples/*/ ;
do
	echo "updating mage in $d"
	
	cp build/lib/mage.js $d/lib/mage.js
	cp build/lib/mage.min.js $d/lib/mage.min.js

	cp build/lib/mage-libs.js $d/lib/mage-libs.js
	cp build/lib/mage-libs.min.js $d/lib/mage-libs.min.js

	cp build/lib/mage-core.js $d/lib/mage-core.js
	cp build/lib/mage-core.min.js $d/lib/mage-core.min.js

	echo "..done."
done

echo "pushing to github"

git add -A
git commit -m '[MAGE BUILD] building mage'
git push origin master

echo "\nupdate completed."
