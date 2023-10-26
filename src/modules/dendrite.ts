const EPOCH = 1698285972831; // start of timestamps; use env var?
export function generateDendrite(timestamp?: number) {
	const sec = ((timestamp || new Date().valueOf()) - EPOCH) / 1000;
	let dendrite = sec.toString(2);
	dendrite = dendrite.padStart(32, "0");
	dendrite += Math.floor(Math.random() * 2 ** 20)
		.toString(2)
		.padStart(20, "0");
	return parseInt(dendrite, 2);
}
export function extractDendrite(dendrite: number) {
	const strDendrite = dendrite.toString(2);
	strDendrite.substring(0, 31);
}
