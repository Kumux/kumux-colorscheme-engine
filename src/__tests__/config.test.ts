import getConfig, { systemConfig } from '../config'
import PRESETS from '../presets'
import getTimeZone_ from '../getTimeZone'
import DEFAULT_CONFIG from '../defaultConfig'
import _cache from 'persistent-cache'
import faker from 'faker'
import { version as npmPackageVersion } from '../../package.json'

jest.mock('application-config', () => () => ({
  read: () => ({}),
  write: jest.fn(),
  filePath: 'foobar',
}))
jest.mock('../getTimeZone', () => jest.fn())
jest.mock('fs', () => ({
  existsSync: (path) => path === 'foobar',
}))

type MockedPersistentCache = jest.Mock & {
  getSync: jest.Mock
}

jest.mock('persistent-cache', () => {
  const cache = jest.fn() as MockedPersistentCache
  cache.mockReturnValue(cache) // constructor
  cache.getSync = jest.fn()
  cache.getSync.mockImplementation((key: string) => FAKE_CACHE[key])

  return cache
})

const cache = _cache as MockedPersistentCache
const FAKE_CACHE = {}

const getTimeZone = getTimeZone_ as jest.Mock
getTimeZone.mockReturnValue('Asia/Tomsk')

describe('getConfig', () => {
  beforeEach(() => {
    systemConfig.filePath = 'foobar'
  })

  it('allows the use of presets', async () => {
    const finalConfig = await getConfig({
      preset: 'nordbox',
    })
    expect(finalConfig.dayBackground).toEqual(PRESETS.nordbox.dayBackground)
  })

 it('gets kumux user id value from persistent cache', async () => {
    FAKE_CACHE.kumux = faker.git.commitSha() // just any fake hash really
    cache.getSync.mock
    const finalConfig = await getConfig({
      preset: 'nordbox',
    })
    expect(finalConfig.kumux).toEqual(FAKE_CACHE.kumux)
  })

 it('gets package version id from package.json', async () => {
    const finalConfig = await getConfig({
      preset: 'nordbox',
    })
    expect(finalConfig.npmPackageVersion).toEqual(npmPackageVersion)
  })

  it('supports different presets', async () => {
    const finalConfig = await getConfig({
      preset: 'dracumux',
    })
    expect(finalConfig.nightBackground).toEqual(
      PRESETS.dracumux.nightBackground
    )
  })


  it('passes location correctly 1', async () => {
    getTimeZone.mockReturnValue('America/Recife')
    const finalConfig = await getConfig({
      preset: 'dracumux',
    })

    expect(finalConfig.geoLocation).toEqual({
      latitude: -8.0539,
      longitude: -34.8808,
    })
  })

  it('passes location correctly 2', async () => {
    getTimeZone.mockReturnValue('Africa/Lagos')
    const finalConfig = await getConfig({
      preset: 'dracumux',
    })

    expect(finalConfig.geoLocation).toEqual({
      latitude: 6.45,
      longitude: 3.4,
    })
  })

  it('creates the confiuration file if it doesnt exist', async () => {
    systemConfig.filePath = 'baz'
    await getConfig({})

    expect(systemConfig.write).toHaveBeenCalledWith(DEFAULT_CONFIG)
  })

  it('does not write config file if it already exists', async () => {
    await getConfig({})

    expect(systemConfig.write).not.toHaveBeenCalled()
  })
})
