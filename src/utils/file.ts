import type { Book } from "@/jotai";
import ePub from "epubjs";
import type Section from "epubjs/types/section";

export async function processEpub(file: File) {
	const buffer = await file.arrayBuffer();
	const epub = ePub(buffer);
	await epub.ready;

	const title = epub.packaging.metadata.title ?? file.name;

	const sectionPromises: Promise<string>[] = [];
	let chapterTitles: string[] = [];

	epub.spine.each((section: Section) => {
		const sectionPromise = (async () => {
			const chapter = await epub.load(section.href);
			if (!(chapter instanceof Document) || !chapter.body?.textContent) {
				return "";
			}
			chapterTitles.push(chapter.title || "No Chapter Title");
			return chapter.body.textContent
				.trim()
				.replace(/\s+/g, " ")
				.replace(/[“”«»]/g, '"')
				.replace(/[‘’]/g, "'");
		})();
		sectionPromises.push(sectionPromise);
	});

	let nextChapterIndex = 0;
	const chapterIndicies: number[] = [];

	const content = await Promise.all(sectionPromises);
	const chapters = content.filter((text, i) => {
		const hasText = !!text;
		if (!hasText) {
			// TODO: Remove corresponding chapterTitle
			chapterTitles = chapterTitles.filter((_, j) => j !== i);
		}
		return hasText;
	});
	for (const chapter of chapters) {
		chapterIndicies.push(nextChapterIndex);
		nextChapterIndex += chapter.length - 1;
	}
	const text = chapters.join(" ");

	const newBook: Book = {
		title,
		index: 0,
		cover: "",
		chapterIndicies,
		text,
	};

	return newBook;
}
