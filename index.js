#!/usr/bin/env node

import { promises as fs } from "fs";
import path from 'path'
import { fileURLToPath } from 'url';
import Mustache from 'mustache'
import moment from 'moment'
import cache from 'persistent-cache'
import 'isomorphic-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_URL = "https://us-central1-kumux-color-scheme-333812.cloudfunctions.net/getColorScheme"
const DATA_CACHE = cache();

const getTemplate = application =>
	fs.readFile(path.resolve(__dirname, 'templates', `${application}.mustache`), 'UTF-8')

const updateThemeData = async () => {
	const lastFetch = moment.unix(DATA_CACHE.getSync('lastFetch'))
	if (lastFetch.subtract(24, 'hours').isBefore(moment())) {
		return null
	}
	const themeDataResponse = await fetch(BACKEND_URL)
	const themeDataResponseJSON = await themeDataResponse.json()

	const { themeData } = themeDataResponseJSON
	const { timeline, themeVariables } = themeData
	DATA_CACHE.putSync("lastFetch", moment().unix())
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

const getThemeVariables = async settings => {
	const { timeline, themeVariables } = await getThemeData()

	const nonPastTimelineItems = timeline
		.filter(([timestamp, _]) => {
			return moment.unix(timestamp).isBefore(moment())
		})
		.sort(([timestamp, _]) => timestamp)
	const currentTimelineItem = nonPastTimelineItems[0]
	const currentHash = currentTimelineItem[1]
	const currentThemeVariables = themeVariables[currentHash]

	return currentThemeVariables
}

export default async function getColorschemeSnapshot(application, settings) {
	const themeVariables = await getThemeVariables()
	const template = await getTemplate(application)
	

	return Mustache.render(template, themeVariables)
}
