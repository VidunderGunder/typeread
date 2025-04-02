import type { Book } from "./jotai";

export const booksDefault = [
	{
		index: 1319,
	},
] as const satisfies Partial<Book>[];
