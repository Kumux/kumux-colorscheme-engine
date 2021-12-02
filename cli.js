#!/usr/bin/env node

import getColorschemeSnapshot from ".";

getColorschemeSnapshot(process.argv[2], {}).then(data => {
	process.stdout.write(data)
})
