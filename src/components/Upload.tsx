import { type ReactNode, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtom, useAtomValue } from "jotai";
import { bookTextAtom, modeAtom, booksAtom, useBook } from "@/jotai";
import { AnimatePresence, motion } from "motion/react";
import { processEpub } from "@/utils/file";

export type UploadProps = {
	children?: ReactNode;
} & Omit<ComponentProps<typeof motion.div>, "children">;

export function Upload({ className, children, ...props }: UploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDrag, setIsDrag] = useState(false);

	const mode = useAtomValue(modeAtom);
	const [books, setBooks] = useAtom(booksAtom);
	const { setBook } = useBook();

	async function processFileAndSave(file: File) {
		const newBook = await processEpub(file);

		const exists = books.some(
			(book) => book.title === newBook.title || book.text === newBook.text,
		);

		if (exists) return;

		setBooks((prev) => [...prev, newBook]);
		setBook(newBook);
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		await processFileAndSave(file);
	}

	async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();
		setIsDrag(false);
		if (e.dataTransfer.files?.[0]) {
			await processFileAndSave(e.dataTransfer.files[0]);
		}
	}

	function handleDrag(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setIsDrag(true);
		} else if (e.type === "dragleave") {
			setIsDrag(false);
		}
	}

	function handleClick() {
		fileInputRef.current?.click();
	}

	return (
		<AnimatePresence>
			{mode === "book" && (
				<motion.div
					className={cn(
						"relative cursor-pointer rounded-lg px-6 py-4 transition-colors duration-150",
						isDrag ? "text-gray-200" : "text-[#545f79] hover:text-[#818eac]",
						"border-2 border-dashed",
						isDrag ? "border-white/20" : "border-white/10",
						className,
					)}
					initial={{
						scale: 0,
					}}
					animate={{
						scale: 1,
					}}
					exit={{
						scale: 0,
					}}
					onDragEnter={handleDrag}
					onDragOver={handleDrag}
					onDragLeave={handleDrag}
					onDrop={handleDrop}
					onClick={handleClick}
					{...props}
				>
					<div
						className={cn(
							"absolute inset-0 size-full rounded-lg",
							isDrag ? "bg-white/10" : "bg-black/25",
						)}
					/>
					<input
						ref={fileInputRef}
						type="file"
						accept=".epub"
						className="hidden"
						onChange={handleFileChange}
					/>
					{children ?? (
						<p className={cn("relative z-0 text-center")}>
							Drop an EPUB file, or
							<br />
							click to upload book
						</p>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export function UploadAfter({ children, ...props }: UploadProps) {
	const bookText = useAtomValue(bookTextAtom);
	const mode = useAtomValue(modeAtom);

	if (mode === "book" && !bookText) return null;

	return (
		<Upload {...props}>
			{children ?? (
				<p className={cn("relative z-0 text-center")}>
					Click or drop an EPUB-file to
					<br />
					add books to your collection
				</p>
			)}
		</Upload>
	);
}
