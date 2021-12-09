import moment from 'moment'
import _cache from 'persistent-cache'
import { doesNeedUpdate, hashObject, SettingsType } from '../index'

type MockedPersistentCache = jest.Mock & {
	getSync: jest.Mock
}

jest.mock('persistent-cache', () => {
	const cache = jest.fn() as MockedPersistentCache
	cache.mockReturnValue(cache)  // constructor
	cache.getSync = jest.fn()

	return cache
})

const cache = _cache as MockedPersistentCache

let FAKE_CACHE: {[_: string]: unknown} = {}
const DEFAULT_CONFIG: SettingsType = {
	dayBackground: "foo",
	nightBackground: "bar",
}


describe('index.ts', () => {
	beforeEach(() => {
		FAKE_CACHE = {
			timeline: [
				[moment().unix(), "foobar"],
				[moment().add(1, "hour").unix(), "foobar"],
				[moment().add(1, "day").unix(), "foobar"],
			],
			configHash: hashObject(DEFAULT_CONFIG),
		}

		cache.getSync.mockImplementation(
			(key: string) => FAKE_CACHE[key]
		)
	})

	describe("doesNeedUpdate", () => {
		it("does not update when last fetch is unset", () => {
			expect(doesNeedUpdate(DEFAULT_CONFIG)).toBe(false)
		})

		it("does not update when last fetch is recent", () => {
			FAKE_CACHE["lastFetch"] = moment().unix()
			expect(doesNeedUpdate(DEFAULT_CONFIG)).toBe(false)
		})

		it("updates when last fetch is too old", () => {
			FAKE_CACHE["lastFetch"] = moment()
				.subtract(24, "days")
				.subtract(1, "minute")
				.unix()

			expect(doesNeedUpdate(DEFAULT_CONFIG)).toBe(true)
		})

		it("updates when future timeline items are not available", () => {
			FAKE_CACHE["timeline"] = [
				[moment().subtract(3, "days").unix(), null]
			]

			expect(doesNeedUpdate(DEFAULT_CONFIG)).toBe(true)
		})

		it("updates when the configuration is changed ", () => {
			expect(doesNeedUpdate({
				...DEFAULT_CONFIG,
				nightBackground: "foobaz"
			})).toBe(true)
		})
	})

})
