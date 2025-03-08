import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { charsAtom, wpmAtom } from "@/jotai";
import { useAtomValue } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";

export type WPMProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function WPM({ className, ...props }: WPMProps) {
	const wpm = useAtomValue(wpmAtom);
	const level: 0 | 1 | 2 | 3 = wpm > 100 ? 3 : wpm > 75 ? 2 : wpm > 50 ? 1 : 0;
	const chars = useAtomValue(charsAtom);

	const finished = !chars.some((e) => e.typed.length === 0);

	return (
		<div
			className={cn(
				"pointer-events-none relative flex items-center justify-center bg-pink-500",
				className,
			)}
			{...props}
		>
			<AnimatePresence>
				{level > 0 && (
					<motion.div
						className="absolute bottom-0 size-max"
						initial={{ scale: 0, opacity: 1 }}
						animate={{
							scale: level * 0.25 + 0.25,
							y: 0,
						}}
						exit={{ scale: 2, opacity: 0 }}
						// bounce plop in and out
						transition={{ duration: 0.25, delay: 0.25 }}
					>
						<motion.div
							animate={{
								x: [0, -0.5, 0, 0.5, 0],
								rotate: [0, 5, 0, -5, 0],
							}}
							transition={{
								repeatType: "loop",
								repeat: Number.POSITIVE_INFINITY,
								// smooth out the animation
								ease: "linear",
								duration: 1,
							}}
						>
							<Icon icon="noto:fire" className="size-[100px]" />
						</motion.div>
					</motion.div>
				)}
				{finished && (
					<motion.div
						className="absolute bottom-0 flex size-max items-center justify-center"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						transition={{ duration: 0.25 }}
					>
						<motion.div
							animate={{}}
							transition={{
								repeatType: "loop",
								repeat: Number.POSITIVE_INFINITY,
								// smooth out the animation
								ease: "linear",
								duration: 1,
							}}
						>
							<Icon icon="noto:party-popper" className="size-[100px]" />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* <span className="absolute size-fit text-nowrap rounded-full bg-pink-600 px-2 font-black text-white drop-shadow-sm">
				{wpm} WPM
			</span> */}
		</div>
	);
}
