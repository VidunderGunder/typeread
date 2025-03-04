export type StringWithSuggestions<T extends string> = T | (string & {});

export type Character = {
	char: string;
	typed: string;
	changed?: number;
};
