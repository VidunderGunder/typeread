import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { motion } from "motion/react";

export type GlowProps = {
	glow: boolean;
} & ComponentProps<typeof motion.div>;

export function Glow({ className, glow = false, ...props }: GlowProps) {
	return (
		<motion.div
			className={cn("rounded-lg", className)}
			animate={{
				boxShadow: glow
					? [
							"0 0 0 0px rgba(255,255,255,0)",
							"0 0 0 3px rgba(255,255,255,1)",
							"0 0 0 4px rgba(255,255,255,0)",
						]
					: [
							"0 0 0 0px rgba(255,255,255,0)",
							"0 0 0 0px rgba(255,255,255,0)",
							"0 0 0 0px rgba(255,255,255,0)",
						],
			}}
			transition={{
				duration: 1.25,
				ease: "easeInOut",
				repeat: Number.POSITIVE_INFINITY,
			}}
			{...props}
		/>
	);
}
