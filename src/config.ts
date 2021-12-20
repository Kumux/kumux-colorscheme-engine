import PRESETS from './presets'
import { SettingsType } from '.'
import initConfig from 'application-config'
import getLocationFromTimezone from './timezoneToLocation'
import getTimeZone from './getTimeZone'
import DEFAULT_CONFIG from './defaultConfig'
import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cache from 'persistent-cache'
// @ts-ignore
import { version as npmPackageVersion } from '../package.json'

export const systemConfig = initConfig('kumux')

const DATA_CACHE = cache({
  base: __dirname,
})

type FinalSettingsType = SettingsType & {
  geoLocation: {
    latitude: number
    longitude: number
  },
  kumux: string,
  npmPackageVersion: string,
}

export default async function getConfig(
  settings: SettingsType
): Promise<FinalSettingsType> {
  const currentSystemConfig = (await systemConfig.read()) as SettingsType
  const kumux = DATA_CACHE.getSync('kumux') || null
  let configValue = {
    geoLocation: getLocationFromTimezone(getTimeZone()),
    ...PRESETS['onedark'],
    ...settings,
    ...currentSystemConfig,
    kumux,
    npmPackageVersion
  }

  if (configValue.preset != null) {
    configValue = {
      ...configValue,
      ...PRESETS[configValue.preset],
    }
  }

  if (!fs.existsSync(systemConfig.filePath)) {
    await systemConfig.write(DEFAULT_CONFIG)
  }

  return configValue
}

export function getConfigPath() {
  return systemConfig.filePath
}
