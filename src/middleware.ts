import getDB from "./modules/db";
import type { MiddlewareResponseHandler } from "astro";
export const onRequest: MiddlewareResponseHandler = (
	{ locals, request },
	next,
) => {
	//[locals.db, locals.rawdb] = getDB();
	return next();
};
