import getConfig from '../config'
import PRESETS from '../presets'

jest.mock('application-config', () => () => ({
	read: () => ({}),
}))

describe('getConfig', () => {
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
})
