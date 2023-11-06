import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { index, integer } from "drizzle-orm/sqlite-core";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const enum UserRole {
	banned = 0,
	unauthenticated = 1,
	user = 2,
	admin = 10, // leave space for other roles in between
}
export const UserRoleMaps = {
	0: "Banned",
	1: "Signed out",
	2: "User",
	10: "Admin",
};
export const Users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull(),
		role: integer("role").$type<UserRole>().default(UserRole.user).notNull(),
		picture: text("picture").notNull(),
		familyName: text("lastName").notNull(),
		givenName: text("firstName").notNull(),
		name: text("name").notNull(),
	},
	(table) => {
		return {
			roleIdx: index("roleIdx").on(
				table.role,
				table.email,
				table.name,
				table.picture,
				table.id,
			),
		};
	},
);
export type UsersSelect = InferSelectModel<typeof Users>;
export type UsersInsert = InferInsertModel<typeof Users>;
