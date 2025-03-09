import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { charsAtom, wpmAtom } from "@/jotai";
import { useAtomValue } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";

export type WPMProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

const showCount: boolean = false;
const showIndicator: boolean = false;

export function WPM({ className, ...props }: WPMProps) {
	const wpm = useAtomValue(wpmAtom);
	const level: 0 | 1 | 2 | 3 = wpm > 100 ? 3 : wpm > 75 ? 2 : wpm > 50 ? 1 : 0;
	const factor = level / 3;
	const chars = useAtomValue(charsAtom);
	const finished = !chars.some((e) => e.typed.length === 0);

	return (
		<div
			className={cn(
				"pointer-events-none relative flex items-center justify-center",
				className,
			)}
			{...props}
		>
			<AnimatePresence>
				{showIndicator && !finished && level >= 1 && (
					<motion.div
						className="absolute size-max"
						initial={{ scale: 0, opacity: 1 }}
						animate={{
							scale: 0.75,
							bottom: showCount ? 20 : 0,
							y: 0,
						}}
						exit={{ scale: 0.75 * factor + 0.25 - 0.25, opacity: 0 }}
						// bounce plop in and out
						transition={{ duration: 0.2, delay: 0.2 }}
					>
						<Wiggle
							hide={level < 3}
							factor={factor}
							className="-rotate-12 absolute right-[90px] bottom-2.5 size-[32px]"
						>
							<Icon icon="noto:cat-with-wry-smile" className="size-full" />
						</Wiggle>
						<Wiggle
							hide={level < 3}
							factor={factor}
							className="absolute bottom-2.5 left-[90px] size-[32px] rotate-12"
						>
							<Icon
								icon="noto:cat-with-wry-smile"
								className="size-full scale-x-[-1]"
							/>
						</Wiggle>
						<Wiggle
							hide={level < 2}
							factor={factor}
							className="absolute right-[50px] bottom-2 size-[46px]"
						>
							<Icon icon="noto:sparkles" className="size-full scale-x-[-1]" />
						</Wiggle>
						<Wiggle
							hide={level < 2}
							factor={factor}
							className="absolute bottom-2 left-[50px] size-[46px]"
						>
							<Icon icon="noto:sparkles" className="size-full" />
						</Wiggle>
						<Wiggle factor={factor}>
							<Icon icon="noto:fire" className="z-0 size-[64px]" />
						</Wiggle>
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
				{showCount && !!chars[0]?.typed?.length && !finished && (
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						className={cn(
							"absolute size-fit text-nowrap rounded-full bg-pink-600 px-2 font-black text-white drop-shadow-sm",
							wpm === 0 ? "opacity-50" : "",
						)}
					>
						{wpm === 0 ? "..." : <>{wpm} WPM</>}
					</motion.span>
				)}
			</AnimatePresence>
		</div>
	);
}

function Wiggle({
	children,
	factor = 1,
	className,
	hide,
	...props
}: ComponentProps<typeof motion.div> & {
	factor?: number;
	hide?: boolean;
}) {
	return (
		<AnimatePresence>
			{!hide && (
				<motion.div
					initial={{
						scale: 0,
					}}
					animate={{
						scale: 1,
					}}
					exit={{
						scale: 0,
					}}
					className={cn("flex items-center justify-center", className)}
					{...props}
				>
					<motion.div
						animate={{
							x: [0, -0.5, 0, 0.5, 0],
							rotate: [0, 5, 0, -5, 0],
						}}
						transition={{
							repeatType: "loop",
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
							stiffness: factor * 100,
						}}
						className="flex size-full items-center justify-center"
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
