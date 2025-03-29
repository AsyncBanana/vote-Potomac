import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { Suggestions } from "./src/schemas/suggestion.ts";
import { config } from "dotenv";
import { Users } from "./src/schemas/user.ts";
import { Comments } from "./src/schemas/comment.ts";
const { parsed: env } = config({
	path:
		process.env.NODE_ENV === "production"
			? "./.dev.vars"
			: "./.env.development",
});
if (!env) throw new Error("No env loaded");
const client = drizzle(
	createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_SECRET,
	}),
);
const ogClient = drizzle(
	createClient({ url: process.argv[2], authToken: process.argv[3] }),
);
await client.transaction(async (tx) => {
	await tx.insert(Users).values(await ogClient.select().from(Users).all());
	await tx.insert(Suggestions).values(
		await ogClient
			.select({
				id: Suggestions.id,
				title: Suggestions.title,
				author: Suggestions.author,
				description: Suggestions.description,
				votes: Suggestions.votes,
			})
			.from(Suggestions)
			.all(),
	);
	await tx.insert(Comments).values(
		await ogClient
			.select({
				id: Comments.id,
				author: Comments.author,
				description: Comments.description,
				votes: Comments.votes,
				parentId: Comments.parentId,
			})
			.from(Comments)
			.all(),
	);
});
