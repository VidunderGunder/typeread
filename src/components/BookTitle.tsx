import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtomValue } from "jotai";
import { bookTitleAtom, modeAtom } from "@/jotai";

export type BookTitleProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function BookTitle({ className, ...props }: BookTitleProps) {
	const bookTitle = useAtomValue(bookTitleAtom);
	const mode = useAtomValue(modeAtom);

	if (mode !== "book") return null;

	return (
		<div
			className={cn(
				"absolute top-28 font-black text-2xl text-black opacity-30",
				className,
			)}
			{...props}
		>
			{bookTitle}
		</div>
	);
}
