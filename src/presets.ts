import {SettingsType} from "."

const PRESETS: {[key: string]: SettingsType} = {
	"onedark": {
		"dayBackground": "#282c34",
		"nightBackground": "#38272c",
	},

	// Based on gruvbox and nord
	"nordbox": {
		"dayBackground": "#2e3440",
		"nightBackground": "#282828",
	},

	// Dracula
	"dracula": {
		"dayBackground": "#282A37",
		"nightBackground": "#2c2122",
	},
}

export default PRESETS
