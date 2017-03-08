#!/bin/bash

for d in examples/*/ ;
do
	echo "updating mage in $d"
	
	cp build/lib/mage.js $d/lib/mage.js
	cp build/lib/mage.min.js $d/lib/mage.min.js
done

echo "done"
