import { useEffect, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { AnimatePresence, motion } from "motion/react";
import { randomUnitVectorTopHalf } from "@/utils/math";

export type SparkleProps = {
	ri?: number;
	dri?: number;
	drd?: number;
	duration?: number;
	sizeFactor?: number;
} & Omit<ComponentProps<typeof motion.div>, "children">;

export function Sparkle({
	className,
	ri = 0,
	dri = 4,
	drd = 6,
	duration = 0.15,
	sizeFactor = 1,
	...props
}: SparkleProps) {
	const size = 1.5 + Math.random() * 1.5 * sizeFactor;
	const { x, y } = randomUnitVectorTopHalf();

	const dr = dri + Math.random() * drd;
	const rf = ri + dr;

	const [hide, setHide] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setHide(true);
		}, duration * 1000);
	}, [duration]);

	return (
		<AnimatePresence>
			{!hide && (
				<motion.div
					className={cn(
						"pointer-events-none absolute transform rounded-full bg-amber-100",
						className,
					)}
					initial={{
						height: size,
						width: size,
						translateX: x * ri,
						translateY: y * ri,
						opacity: 1,
					}}
					animate={{
						height: size * 1.5,
						width: size * 1.5,
						translateX: x * rf * 0.875,
						translateY: y * rf * 0.875,
						opacity: 1,
					}}
					exit={{
						height: size * 2,
						width: size * 2,
						translateX: x * rf * 1,
						translateY: y * rf * 1,
						opacity: 0,
					}}
					transition={{
						duration,
					}}
					{...props}
				/>
			)}
		</AnimatePresence>
	);
}

export type SparklesProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

const arr = Array.from({ length: 25 });

export function Sparkles({ className, ...props }: SparklesProps) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute flex size-full items-center justify-center overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="relative flex size-full items-center justify-center">
				<div className="absolute bottom-1 mx-auto">
					{arr.map((_, i) => {
						const dri = Math.random() * 50;
						const drd = 250 + Math.random() * 350;
						const duration = 0.25 + Math.random() * 0.5;
						return (
							<Sparkle
								key={[i].join("-")}
								dri={dri}
								drd={drd}
								duration={duration}
								sizeFactor={2.5}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
