#!/usr/bin/env node

import { promises as fs } from "fs";
import path from 'path'
import { fileURLToPath } from 'url';
import Mustache from 'mustache'
import moment from 'moment'
// @ts-ignore
import cache from 'persistent-cache'
import fetch from 'cross-fetch';

type SettingsType = {}
type ApplicationType = string
type TimeStampItem = [number, string]

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_URL = "https://us-central1-kumux-color-scheme-333812.cloudfunctions.net/getColorScheme"
const DATA_CACHE = cache({
	base: __dirname
});

const getTemplate = (application: ApplicationType) =>
	fs.readFile(path.resolve(__dirname, 'templates', `${application}.mustache`), { encoding: 'utf-8' })

export const updateThemeData = async () => {
	const lastFetch = moment.unix(DATA_CACHE.getSync('lastFetch'))  // TODO: consider actual timestamp items
	if (lastFetch.subtract(24, 'hours').isBefore(moment())) {
		return null
	}
	const themeDataResponse = await fetch(BACKEND_URL)
	const themeDataResponseJSON = await themeDataResponse.json()

	const { themeData } = themeDataResponseJSON
	const { timeline, themeVariables } = themeData
	DATA_CACHE.putSync("timeline", timeline)
	DATA_CACHE.putSync("themeVariables", themeVariables)

	return null
}

const getThemeData = async () => {
	await updateThemeData()
	const timeline = DATA_CACHE.getSync('timeline')
	const themeVariables = DATA_CACHE.getSync('themeVariables')
	
	return { timeline, themeVariables }
}

const getThemeVariables = async (settings: SettingsType) => {
	const { timeline, themeVariables } = await getThemeData()

	const nonPastTimelineItems = timeline
		.filter(([timestamp, _]: TimeStampItem) => {
			return moment.unix(timestamp).isAfter(moment())
		})
		.sort(([timestamp, _]: TimeStampItem) => timestamp)
	const currentTimelineItem = nonPastTimelineItems[0]
	const currentHash = currentTimelineItem[1]
	const currentThemeVariables = themeVariables[currentHash]

	return currentThemeVariables
}

export default async function getColorschemeSnapshot(application: ApplicationType, settings: SettingsType) {
	const themeVariables = await getThemeVariables({})
	const template = await getTemplate(application)
	

	return Mustache.render(template, themeVariables)
}
