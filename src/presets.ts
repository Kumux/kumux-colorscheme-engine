import {PresetType} from "."

const PRESETS: {[key: string]: PresetType} = {
	"onedark": {
		"dayBackground": "#282c34",
		"nightBackground": "#38272c",
	},

	// Based on gruvbox and nord
	"nordbox": {
		"dayBackground": "#2e3440",
		"nightBackground": "#282828",
	},

	// Dracula inspired
	"dracumux": {
		"dayBackground": "#282A37",
		"nightBackground": "#372828",
	},
}

export default PRESETS
