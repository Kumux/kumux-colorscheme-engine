#!/usr/bin/env node

import getColorschemeSnapshot from './index.js'

getColorschemeSnapshot(process.argv[2], {}).then(data => {
    process.stdout.write(data)
})
