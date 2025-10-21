import type { APIRoute } from "astro";
import getSuggestions from "../../modules/getSuggestions";
import type { FoodLocation } from "../../schemas/suggestion";
export const GET: APIRoute = async (ctx) => {
	const query = ctx.url.searchParams.get("q");
	const sort = ctx.url.searchParams.get("sort") as "top" | "recent" | undefined;
	const offset = ctx.url.searchParams.get("offset");
	const isFood = ctx.url.searchParams.has("food");
	const foodLocation = ctx.url.searchParams.has("location")
		? ctx.url.searchParams.get("location")
		: undefined;
	const res = await getSuggestions(
		{
			query,
			offset: offset ? +offset : undefined,
			isFood,
			sort,
			foodLocation: foodLocation ? (+foodLocation as FoodLocation) : undefined,
		},
		ctx,
	);
	if (res.length === 0) return new Response("", { status: 404 });
	return new Response(JSON.stringify(res));
};
