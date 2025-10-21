import type { SuggestionMetadata } from "../schemas/suggestion";

export interface SuggestionPreview {
	id: number;
	voteCount: number | null;
	title: string;
	votes: string[] | null;
	downvotes: string[] | null;
	metadata?: SuggestionMetadata | null;
}
