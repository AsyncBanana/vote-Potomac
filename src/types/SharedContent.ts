export const ContentStatus = {
	ModerationQueue: 0,
	Active: 1,
	Archive: 2,
	FoodActive: 3,
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
