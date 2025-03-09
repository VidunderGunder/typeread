import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtomValue } from "jotai";
import {
	bookChaptersAtom,
	bookChapterTitleAtom,
	bookTitleAtom,
	modeAtom,
} from "@/jotai";

export type BookTitleProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function BookTitle({ className, ...props }: BookTitleProps) {
	const bookTitle = useAtomValue(bookTitleAtom);
	const mode = useAtomValue(modeAtom);
	const chapters = useAtomValue(bookChaptersAtom);
	const chapterTitle = useAtomValue(bookChapterTitleAtom);

	console.log({
		chapters,
		chapterTitle,
	});

	if (mode !== "book") return null;

	return (
		<div
			className={cn(
				"absolute top-[min(max(100px,10dvh),125px)] flex gap-4 font-black text-3xl",
				className,
			)}
			{...props}
		>
			📖<span className="text-white opacity-100">{bookTitle}</span>
		</div>
	);
}
