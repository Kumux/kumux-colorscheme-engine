export default function getTimeZone() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone
}
