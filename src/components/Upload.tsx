import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ePub from "epubjs";
import type Section from "epubjs/types/section";

export type UploadProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Upload({ className, ...props }: UploadProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/*  */}
		</div>
	);
}

export default async function getChaptersFromEpub(
	epub: string | ArrayBuffer,
): Promise<string[]> {
	const book = ePub(epub);
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
	return content.filter((text) => text);
}
