import type { APIRoute } from "astro";
import { UserRole, UserRoleMaps, Users } from "../../../schemas/user";
import { eq } from "drizzle-orm";
export interface RoleChange {
	user: string;
	role: UserRole;
}
export const POST: APIRoute = async (ctx) => {
	const session = await ctx.locals.getSession();
	if (!session)
		return new Response("Unauthenticated", {
			status: 401,
		});
	if (session.role < UserRole.admin)
		return new Response("Must be admin to change roles", {
			status: 403,
		});
	const data = await ctx.request.json<RoleChange>(); // TODO: Properly handle invalid JSON
	if (
		typeof data.user !== "string" ||
		!UserRoleMaps[data.role] ||
		data.role === UserRole.unauthenticated
	)
		return new Response("Invalid body", {
			status: 400,
		});
	await ctx.locals.db
		.update(Users)
		.set({
			role: data.role,
		})
		.where(eq(Users.id, data.user));
	return new Response("Changed user role");
};
