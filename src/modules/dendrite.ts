/**
 * Generate a dendrite (basically a 52 bit snowflake with random ids rather than machine and sequence ids)
 * @param timestamp Timestamp to use. Defaults to Date.now()
 * @returns dendrite
 */
export function generateDendrite(timestamp?: number) {
	// optimize creation using arraybuffer?
	const sec = Math.floor(
		((timestamp || Date.now()) - import.meta.env.EPOCH) / 1000,
	);
	let dendrite = sec.toString(2);
	dendrite = dendrite.padStart(32, "0");
	dendrite += Math.floor(Math.random() * 2 ** 20)
		.toString(2)
		.padStart(20, "0");

	return parseInt(dendrite, 2);
}
export function extractDendrite(dendrite: number) {
	const strDendrite = dendrite.toString(2);
	const timestamp = new Date(
		parseInt(strDendrite.substring(0, strDendrite.length - 20), 2) * 1000 +
			+import.meta.env.EPOCH,
	);
	return timestamp;
}
