import type { QuestionQueryConfig } from "../modules/getSuggestions";

let rawQueryConfig = $state<QuestionQueryConfig>({});
export const queryConfig = () => rawQueryConfig;
if (globalThis?.location) {
	const params = new URLSearchParams(globalThis.location.search);
	rawQueryConfig = {
		query: params.get("q"),
		// @ts-expect-error stfu idc anymore
		sort: params.get("sort"),
		location: params.get("location"),
	};
}
