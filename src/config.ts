import PRESETS from './presets'
import {SettingsType} from "."
import initConfig from 'application-config'


const systemConfig = initConfig("kumux")

export default async function getConfig(settings: SettingsType): Promise<SettingsType> {
	const currentSystemConfig = await systemConfig.read() as SettingsType
	let configValue = { 
		...PRESETS["onedark"],
		...settings,
		...currentSystemConfig,
	}

	if (configValue.preset != null) {
		configValue = {
			...configValue,
			...PRESETS[configValue.preset]
		}
	}

	return configValue
}

export function getConfigPath() {
	return systemConfig.filePath
}
