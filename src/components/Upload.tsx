import { useRef, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ePub from "epubjs";
import type Section from "epubjs/types/section";
import { useAtom, useSetAtom } from "jotai";
import {
	bookTextAtom,
	bookCoverAtom,
	bookIndexAtom,
	bookTitleAtom,
} from "@/jotai";

export type UploadProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Upload({ className, ...props }: UploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [text, setText] = useAtom(bookTextAtom);
	const setIndex = useSetAtom(bookIndexAtom);
	const setCover = useSetAtom(bookCoverAtom);
	const setTitle = useSetAtom(bookTitleAtom);

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const buffer = await file.arrayBuffer();

		const book = ePub(buffer);
		await book.ready;

		const sectionPromises: Promise<string>[] = [];

		book.spine.each((section: Section) => {
			const sectionPromise = (async () => {
				const chapter = await book.load(section.href);
				if (!(chapter instanceof Document) || !chapter.body?.textContent) {
					return "";
				}
				return chapter.body.textContent.trim();
			})();

			sectionPromises.push(sectionPromise);
		});

		const content = await Promise.all(sectionPromises);
		const chapters = content.filter((text) => text);
		const newText = chapters.join(" ");
		const cleanText = newText.replaceAll(/\s/g, " ");

		// const coverUrl = await book.coverUrl(); // Returns something like `blob:http://localhost:5173/7a100ac7-205a-48b0-8b2e-ff9dda4e267a`

		setText(cleanText);
		setIndex(0);
		// setCover(coverUrl ?? "");
		setTitle(book.packaging.metadata.title ?? file.name);
	}

	return (
		<div className={cn("", className)} {...props}>
			<input
				ref={fileInputRef}
				type="file"
				accept=".epub"
				onChange={handleFileChange}
			/>
		</div>
	);
}
