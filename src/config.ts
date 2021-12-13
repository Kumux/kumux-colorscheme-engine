import PRESETS from './presets'
import {SettingsType} from "."
import initConfig from 'application-config'
import getLocationFromTimezone from './timezoneToLocation'
import getTimeZone from './getTimeZone'


const systemConfig = initConfig("kumux")

type FinalSettingsType = SettingsType & {
	geoLocation: {
		latitude: number,
		longitude: number,
	}
}

export default async function getConfig(settings: SettingsType): Promise<FinalSettingsType> {
	const currentSystemConfig = await systemConfig.read() as SettingsType
	let configValue = { 
		geoLocation: getLocationFromTimezone(getTimeZone()),
		...PRESETS["onedark"],
		...settings,
		...currentSystemConfig,
	}

	if (configValue.preset != null) {
		configValue = {
			...configValue,
			...PRESETS[configValue.preset],
		}
	}

	return configValue
}

export function getConfigPath() {
	return systemConfig.filePath
}
