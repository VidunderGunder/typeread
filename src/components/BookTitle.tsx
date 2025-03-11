import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtomValue, useSetAtom } from "jotai";
import {
	bookChapterIndiciesAtom,
	bookIndexAtom,
	booksAtom,
	bookTextAtom,
	bookTitleAtom,
	modeAtom,
	useBook,
} from "@/jotai";
import { motion } from "motion/react";
import { Icon } from "@iconify/react/dist/iconify.js";

export type BookTitleProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function BookTitle({ className, ...props }: BookTitleProps) {
	const bookTitle = useAtomValue(bookTitleAtom);
	const mode = useAtomValue(modeAtom);
	const bookIndex = useAtomValue(bookIndexAtom);
	const bookText = useAtomValue(bookTextAtom);
	const indicies = useAtomValue(bookChapterIndiciesAtom);
	const books = useAtomValue(booksAtom);
	const { setBook } = useBook();

	const currentBookIndex = books.findIndex((book) => book.title === bookTitle);

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const selectedIndex = Number.parseInt(e.target.value, 10);
		const selectedBook = books[selectedIndex];
		if (selectedBook) {
			// Update the atoms with the selected book's properties
			setBook(selectedBook);
		}
	}

	function indexToPercent(index: number): number {
		return Number(((100 * index) / (bookText.length + 1)).toFixed(2));
	}

	const progress = indexToPercent(bookIndex);

	if (mode !== "book" || !bookText) return null;

	return (
		<div
			className={cn(
				"flex w-[500px] max-w-full flex-col items-center gap-1",
				className,
			)}
			{...props}
		>
			{/* TODO: Convert title to a nice select/dropdown to select books, skip cover for now */}
			{/* <div className={"flex gap-4 font-black text-xl"}>
				<span className="text-white/100">{bookTitle}</span>
			</div> */}

			<div className="relative flex items-center gap-4 font-black text-xl">
				<select
					value={currentBookIndex >= 0 ? currentBookIndex : 0}
					onChange={handleChange}
					className="cursor-pointer appearance-none rounded-lg bg-transparent px-3 py-1 pr-8 font-black text-white text-xl hover:bg-white/10"
				>
					{books.map((book, index) => (
						<option key={book.title} value={index}>
							{book.title}
						</option>
					))}
				</select>
				<Icon
					icon="material-symbols:arrows-outward-rounded"
					className="absolute right-2 rotate-90"
				/>
			</div>

			<motion.div className="full relative flex h-[18px] w-full items-center justify-center overflow-clip rounded-full bg-black/60">
				<div className="absolute bottom-0 flex h-full w-full justify-start overflow-clip rounded-full">
					<motion.div
						className="h-full bg-green-600"
						animate={{
							width: `${progress}%`,
						}}
					/>
				</div>
				<div className="absolute bottom-0 h-full w-full">
					{indicies.map((i) => {
						if (i === 0) return null;
						const isPassed = bookIndex >= i;
						return (
							<div
								key={i}
								className="absolute h-full"
								style={{
									left: `${indexToPercent(i)}%`,
								}}
							>
								<div
									className={cn(
										"-right-[1px] absolute h-full w-[1px] rounded-full",
										isPassed ? "bg-green-800" : "bg-white/15",
									)}
								/>
							</div>
						);
					})}
				</div>
				<motion.div className="absolute text-sm text-white/90">
					{progress}%
				</motion.div>
			</motion.div>
		</div>
	);
}
