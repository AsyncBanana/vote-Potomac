import { generateOAuthURL, verifyJWT } from "./modules/auth";
import getDB from "./modules/db";
import { UserRole, Users } from "./schemas/user";
import { and, desc, eq, exists, sql } from "drizzle-orm";
import type { Props as AppLayoutProps } from "./layouts/AppLayout.astro";
import { defineMiddleware, sequence } from "astro:middleware";
import type { SuggestionPreview } from "./types/Data";
import { SuggestionsFTS } from "./schemas/fts";
import { Suggestions as SuggestionsTable } from "./schemas/suggestion";
import { ContentStatus } from "./types/SharedContent";
const localsInit = defineMiddleware((ctx, next) => {
	ctx.locals.runtime.env = { ...import.meta.env, ...ctx.locals.runtime.env };
	[ctx.locals.db, ctx.locals.rawdb] = getDB(ctx.locals.runtime.env);
	ctx.locals.login = (finalRedirectUrl?: string) => {
		const [redirectURL, state] = generateOAuthURL(
			ctx.url.origin + "/api/auth/callback",
			ctx.locals.runtime.env,
		);
		ctx.cookies.set(`authState`, state, {
			secure: import.meta.env.PROD,
			httpOnly: true,
			sameSite: "lax",
			maxAge: 1200,
			path: "/api/auth/",
		});
		ctx.cookies.set(`authRedirectUrl`, finalRedirectUrl || "/", {
			secure: import.meta.env.PROD,
			httpOnly: true,
			sameSite: "lax",
			maxAge: 1200,
			path: "/api/auth/",
		});
		return ctx.redirect(redirectURL.toString());
	};
	// @ts-ignore
	ctx.locals.getSession = async () => {
		const authData = ctx.cookies.get("authData")?.value;
		if (!authData) return;
		const id = await verifyJWT(ctx.locals.runtime.env, authData);
		if (!id) return;
		return ctx.locals.db.select().from(Users).where(eq(Users.id, id)).get();
	};
	ctx.locals.getSuggestions = async ({ query, offset, sort, isFood }) => {
		// @ts-expect-error FTS table types not include metadata, types don't handle that correctly
		const suggestions: SuggestionPreview[] = await (query
			? ctx.locals.db
					.select({
						id: SuggestionsFTS.id,
						title: SuggestionsFTS.title,
						voteCount: SuggestionsFTS.voteCount,
						votes: SuggestionsFTS.votes,
						downvotes: SuggestionsFTS.downvotes,
					})
					.from(SuggestionsFTS)
					.where(sql`${SuggestionsFTS.title} MATCH ${query}`)
					.offset(offset || 0) // Could prevent scan of results by implementing offset using votes/date
					.limit(30)
					.orderBy(sql`rank`)
			: ctx.locals.db
					.select({
						id: SuggestionsTable.id,
						title: SuggestionsTable.title,
						voteCount: SuggestionsTable.voteCount,
						votes: SuggestionsTable.votes,
						downvotes: SuggestionsTable.downvotes,
						metadata: SuggestionsTable.metadata,
					})
					.from(SuggestionsTable)
					.where(
						and(
							eq(
								SuggestionsTable.status,
								isFood ? ContentStatus.FoodActive : ContentStatus.Active,
							),
							isFood && location
								? exists(
										ctx.locals.db
											.select({ v: sql`1` })
											.from(
												sql`json_each(${SuggestionsTable.metadata}-> 'locations')`,
											)
											.where(eq(sql`value`, +location)),
									)
								: undefined,
						),
					)
					.limit(30)

					.orderBy(
						desc(
							sort === "top" ? SuggestionsTable.voteCount : SuggestionsTable.id,
						),
					)
					.offset(offset || 0));
		return suggestions;
	};
	ctx.locals.handle = async (props) => {
		if (!props.minimumRole) props.minimumRole = UserRole.unauthenticated;
		if (props.userData === undefined) {
			props.userData = await ctx.locals.getSession();
		}
		if (props.minimumRole > UserRole.unauthenticated && !props.userData) {
			return { type: "error", data: ctx.locals.login(ctx.url.toString()) };
		}
		if (
			(props.userData?.role || UserRole.unauthenticated) < props.minimumRole
		) {
			return {
				type: "error",
				data: new Response("You lack the permissions to access this page", {
					status: 403,
				}),
			};
		}
		return {
			type: "data",
			data: props as AppLayoutProps,
		};
	};
	return next();
});
const logger = defineMiddleware(async (ctx, next) => {
	const response = await next();
	if (!(response.status > 199 && response.status < 400)) {
		const logResponse = response.clone();
		const body =
			logResponse.headers.get("Content-Type") === "text/html"
				? "HTML Text"
				: await logResponse.text();
		console.log({
			body,
			message: `Response returned error code ${logResponse.status} and body "${body}"`,
		});
	}
	return response;
});

export const onRequest = sequence(localsInit, logger);
