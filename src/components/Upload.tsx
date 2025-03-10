import { type ReactNode, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ePub from "epubjs";
import type Section from "epubjs/types/section";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	bookTextAtom,
	bookCoverAtom,
	bookIndexAtom,
	bookTitleAtom,
	bookChaptersAtom,
	modeAtom,
} from "@/jotai";
import { AnimatePresence, motion } from "motion/react";

export type UploadProps = {
	children?: ReactNode;
} & Omit<ComponentProps<typeof motion.div>, "children">;

export function Upload({ className, children, ...props }: UploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDrag, setIsDrag] = useState(false);
	const [text, setText] = useAtom(bookTextAtom);
	const setIndex = useSetAtom(bookIndexAtom);
	const setCover = useSetAtom(bookCoverAtom);
	const setTitle = useSetAtom(bookTitleAtom);
	const setBookChapters = useSetAtom(bookChaptersAtom);
	const mode = useAtomValue(modeAtom);

	async function processFile(file: File) {
		const buffer = await file.arrayBuffer();
		const book = ePub(buffer);
		await book.ready;

		const sectionPromises: Promise<string>[] = [];
		let chapterTitles: string[] = [];

		book.spine.each((section: Section) => {
			const sectionPromise = (async () => {
				const chapter = await book.load(section.href);
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

		const content = await Promise.all(sectionPromises);
		const chapters = content.filter((text, i) => {
			const hasText = !!text;
			if (!hasText) {
				// TODO: Remove corresponding chapterTitle
				chapterTitles = chapterTitles.filter((_, j) => j !== i);
			}
			return hasText;
		});
		const newText = chapters.join(" ");

		setBookChapters({});
		setText(newText);
		setIndex(0);
		// const coverUrl = await book.coverUrl();
		// setCover(coverUrl ?? "");
		setTitle(book.packaging.metadata.title ?? file.name);
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		await processFile(file);
	}

	async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();
		setIsDrag(false);
		if (e.dataTransfer.files?.[0]) {
			await processFile(e.dataTransfer.files[0]);
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
						<div className={cn("relative z-0 text-center")}>
							Drop an EPUB file, or
							<div />
							click to upload book
						</div>
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
				<div className={cn("relative z-0 text-center")}>
					Drop an EPUB file, or
					<div />
					click to replace book
				</div>
			)}
		</Upload>
	);
}
