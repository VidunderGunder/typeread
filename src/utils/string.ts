export function getWordAtIndex(str: string, index: number) {
	let startOfWord = 0;
	let endOfWord = 0;

	let char: string | undefined = str[index];

	if (char === " ") {
		endOfWord = index;
	} else {
		for (let i = index; i < str.length; i++) {
			char = str[i];
			if (char === " ") {
				endOfWord = i;
				break;
			}
			if (i === str.length - 1) {
				endOfWord = i + 1;
				break;
			}
		}
	}

	for (let i = index - 1; i > 0; i--) {
		char = str[i];
		if (char === " " || i === 0) {
			startOfWord = i + 1;
			break;
		}
	}

	const word = str
		.split("")
		.splice(startOfWord, endOfWord - startOfWord)
		.join("");

	return word;
}
