#!/usr/bin/env node

import getColorschemeSnapshot from './index.js'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'

Sentry.init({
  dsn: 'https://530d556fe4f94451b35d0f2631175fac@o1091251.ingest.sentry.io/6110593',
  tracesSampleRate: 1.0,
})

getColorschemeSnapshot(process.argv[2], {}).then((data) => {
  process.stdout.write(data)
})
