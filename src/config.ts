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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
  }
  kumux: string
  npmPackageVersion: string
  contrast: {
    day: number
    night: number
  }
}

export type ContrastSettingsType = {
  day: keyof ContrastLevel | number
  night: keyof ContrastLevel | number
}

export enum ContrastLevel {
  // The minimum is 1.5 because the theoretical minimum, 1, would by definition
  // result in illegible text.
  minimum = 1.5,
  lowest = 2,
  lower = 3,
  low = 4.5,
  medium = 6,
  high = 7,
  higher = 9,
  highest = 15,

  // The theoretical maximum (21) would always result in black and white text,
  // rendering this color scheme useless as there would not be any effect left
  maximum = 18,
}

const parseContrast = (contrast: ContrastSettingsType) => {
  return {
    day: Number.isFinite(contrast.day)
      ? contrast.day
      : ContrastLevel[contrast.day],
    night: Number.isFinite(contrast.night)
      ? contrast.night
      : ContrastLevel[contrast.night],
  }
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
    contrast: parseContrast({
      ...DEFAULT_CONFIG.contrast,
      ...currentSystemConfig?.contrast,
      ...settings.contrast,
    }),
    kumux,
    npmPackageVersion,
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
