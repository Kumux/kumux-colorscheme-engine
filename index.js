import { promises as fs } from "fs";
import path from 'path'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url';
import Mustache from 'mustache'
import moment from 'moment'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_URL = "http://localhost:8080/"

const getTemplate = application =>
	fs.readFile(path.resolve(__dirname, 'templates', `${application}.mustache`), 'UTF-8')

const getThemevariables = async settings => {
	const themeDataResponse = await fetch(BACKEND_URL)
	const themeDataResponseJSON = await themeDataResponse.json()

	const { themeData } = themeDataResponseJSON
	const { timeline, themeVariables } = themeData

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
	const themeVariables = await getThemevariables()
	const template = await getTemplate(application)
	

	return Mustache.render(template, themeVariables)
}

getColorschemeSnapshot("emacs", {}).then(data => {
	process.stdout.write(data)
})
