#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import Mustache from 'mustache'
import moment from 'moment'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cache from 'persistent-cache'
import fetch from 'cross-fetch'
import getConfig, { ContrastLevel } from './config'

export type PresetType = {
  dayBackground?: string
  nightBackground?: string
}

export type SettingsType = PresetType & {
  preset?: string | null
  contrast?: {
    day?: keyof ContrastLevel | number
    night?: keyof ContrastLevel | number
  }
}

type ApplicationType = string
type TimelineItem = [number, string]
type Timeline = Array<TimelineItem>

const BACKEND_URL =
  'https://us-central1-kumux-color-scheme-333812.cloudfunctions.net/getColorScheme'
const DATA_CACHE = cache({
  base: __dirname,
})

export const hashObject = (input: unknown) => {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
    .substring(0, 7)
}

export const doesNeedUpdate = (settings: SettingsType) => {
  const lastFetch = moment.unix(DATA_CACHE.getSync('lastFetch'))
  const oldestAcceptedLastFetch = moment().subtract(24, 'hours')
  const timeline = DATA_CACHE.getSync('timeline')
  const configHash = DATA_CACHE.getSync('configHash')

  if (configHash !== hashObject(settings)) {
    return true
  }

  if (getNonPastTimelineItems(timeline).length === 0) {
    return true
  }

  return lastFetch.isBefore(oldestAcceptedLastFetch)
}

const getTemplate = (application: ApplicationType) =>
  fs.readFile(
    path.resolve(__dirname, '..', 'templates', `${application}.mustache`),
    { encoding: 'utf-8' }
  )

export const updateThemeData = async (settings: SettingsType) => {
  const currentConfigHash = hashObject(settings)
  const themeDataResponse = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  })
  const themeDataResponseJSON = await themeDataResponse.json()

  const { themeData, kumux } = themeDataResponseJSON
  const { timeline, themeVariables } = themeData
  DATA_CACHE.putSync('lastFetch', moment().unix())
  DATA_CACHE.putSync('configHash', currentConfigHash)
  DATA_CACHE.putSync('timeline', timeline)
  DATA_CACHE.putSync('themeVariables', themeVariables)
  DATA_CACHE.putSync('kumux', kumux)

  return null
}

const getThemeData = async (settings: SettingsType) => {
  if (doesNeedUpdate(settings)) {
    await updateThemeData(settings)
  }
  const timeline = DATA_CACHE.getSync('timeline')
  const themeVariables = DATA_CACHE.getSync('themeVariables')

  return { timeline, themeVariables }
}

const getNonPastTimelineItems = (timeline: Timeline) => {
  return timeline
    .filter(([timestamp]: TimelineItem) => {
      return moment.unix(timestamp).isAfter(moment())
    })
    .sort(([timestamp]: TimelineItem) => timestamp)
}

const getThemeVariables = async (settings: SettingsType) => {
  const { timeline, themeVariables } = await getThemeData(settings)

  const nonPastTimelineItems = getNonPastTimelineItems(timeline)
  const currentTimelineItem = nonPastTimelineItems[0]
  const currentHash = currentTimelineItem[1]
  const currentThemeVariables = themeVariables[currentHash]

  return currentThemeVariables
}

export default async function getColorschemeSnapshot(
  application: ApplicationType,
  settings: SettingsType
) {
  const themeVariables = await getThemeVariables(await getConfig(settings))
  const template = await getTemplate(application)

  return Mustache.render(template, themeVariables)
}
