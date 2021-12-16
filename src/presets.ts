import { PresetType } from '.'

const PRESETS: { [key: string]: PresetType } = {
  default: {
    dayBackground: '#282c34',
    nightBackground: '#38272c',
  },

  onedark: {
    dayBackground: '#282c34',
    nightBackground: '#38272c',
  },

  // Based on gruvbox and nord
  nordbox: {
    dayBackground: '#2e3440',
    nightBackground: '#282828',
  },

  // Dracula inspired
  dracumux: {
    dayBackground: '#282A37',
    nightBackground: '#372828',
  },

  // Based on solarized
  solarized: {
    dayBackground: '#002b36',
    nightBackground: '#372f28',
  },
}

export default PRESETS
