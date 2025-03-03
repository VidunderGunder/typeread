import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { motion } from "motion/react";
import { randomUnitVectorTopHalf } from "@/utils/math";

export type SparkleProps = {
	ri?: number;
	dri?: number;
	drd?: number;
} & Omit<ComponentProps<typeof motion.div>, "children">;

export function Sparkle({
	className,
	ri = 0,
	dri = 4,
	drd = 6,
	...props
}: SparkleProps) {
	const size = 1.5 + Math.random() * 1.25;
	const { x, y } = randomUnitVectorTopHalf();

	const dr = dri + Math.random() * drd;
	const rf = ri + dr;

	return (
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
				opacity: 0.5,
			}}
			animate={{
				height: size * 2,
				width: size * 2,
				translateX: x * rf,
				translateY: y * rf,
				opacity: 0,
			}}
			transition={{
				duration: 0.35,
			}}
			{...props}
		/>
	);
}

export type SparklesProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Sparkles({ className, ...props }: SparklesProps) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 flex size-full items-center justify-center",
				className,
			)}
			{...props}
		>
			<Sparkle />
			<Sparkle />
			<Sparkle />
			<Sparkle />
			<Sparkle />
		</div>
	);
}
