import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtomValue } from "jotai";
import { bookIndexAtom, bookTextAtom, bookTitleAtom, modeAtom } from "@/jotai";
import { motion } from "motion/react";

export type BookTitleProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function BookTitle({ className, ...props }: BookTitleProps) {
	const bookTitle = useAtomValue(bookTitleAtom);
	const mode = useAtomValue(modeAtom);
	const bookIndex = useAtomValue(bookIndexAtom);
	const bookText = useAtomValue(bookTextAtom);

	const progress = ((100 * bookIndex) / (bookText.length + 1)).toFixed(2);

	// TODO: Display current chapter

	// console.log({
	// 	chapters,
	// 	chapterTitle,
	// });

	if (mode !== "book") return null;

	return (
		<div
			className={cn(
				"flex w-[500px] max-w-full flex-col items-center gap-1",
				className,
			)}
			{...props}
		>
			<div className={"flex gap-4 font-black text-xl"}>
				<span className="text-white/100">{bookTitle}</span>
			</div>
			<motion.div className="full relative flex h-[18px] w-full items-center justify-center overflow-clip rounded-full bg-black/20">
				<motion.div className="absolute text-sm text-white/90">
					{progress}%
				</motion.div>
				<div className="flex h-full w-full justify-start">
					<motion.div
						className="h-full bg-green-600"
						animate={{
							width: `${progress}%`,
						}}
					/>
				</div>
			</motion.div>
		</div>
	);
}
