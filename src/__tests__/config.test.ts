import getConfig, { systemConfig } from '../config'
import PRESETS from '../presets'
import getTimeZone_ from '../getTimeZone'
import DEFAULT_CONFIG from '../defaultConfig'

jest.mock('application-config', () => () => ({
	read: () => ({}),
	write: jest.fn(),
	filePath: "foobar",
}))
jest.mock('../getTimeZone', () => jest.fn())
jest.mock('fs', () => ({
	existsSync: (path) => path === "foobar"
}))

const getTimeZone = getTimeZone_ as jest.Mock
getTimeZone.mockReturnValue('Asia/Tomsk')

describe('getConfig', () => {
	beforeEach(() => {
		systemConfig.filePath = "foobar"
	})

	it('allows the use of presets', async () => {
		const finalConfig = await getConfig({
				"preset": "nordbox"
			})
		expect(finalConfig.dayBackground).toEqual(PRESETS.nordbox.dayBackground)
	})

	it('supports different presets', async () => {
		const finalConfig = await getConfig({
				"preset": "dracumux"
			})
		expect(finalConfig.nightBackground).toEqual(PRESETS.dracumux.nightBackground)
	})
	
	it('passes location correctly 1', async () => {
		getTimeZone.mockReturnValue('America/Recife')
		const finalConfig = await getConfig({
				"preset": "dracumux"
		})

		expect(finalConfig.geoLocation).toEqual({
			latitude: -8.0539,
			longitude: -34.8808,
		})
	})

	it('passes location correctly 2', async () => {
		getTimeZone.mockReturnValue('Africa/Lagos')
		const finalConfig = await getConfig({
				"preset": "dracumux"
		})

		expect(finalConfig.geoLocation).toEqual({
			latitude: 6.45,
			longitude: 3.4,
		})
	})

	it('creates the confiuration file if it doesnt exist', async () => {
		systemConfig.filePath = "baz"
		await getConfig({})

		expect(systemConfig.write).toHaveBeenCalledWith(DEFAULT_CONFIG)
	})

	it('does not write config file if it already exists', async () => {
		await getConfig({})

		expect(systemConfig.write).not.toHaveBeenCalled()
	})
})
