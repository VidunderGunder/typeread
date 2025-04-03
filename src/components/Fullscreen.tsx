import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useFullscreen } from "@mantine/hooks";

export type FullscreenProps = {
	//
} & Omit<ComponentProps<"button">, "children">;

export function Fullscreen({ className, ...props }: FullscreenProps) {
	const { fullscreen, toggle } = useFullscreen();

	return (
		<button
			type="button"
			className={cn(
				"flex size-11 cursor-pointer items-center justify-center gap-1 rounded-xl hover:bg-white/10",
				className,
			)}
			title="Fullscreen"
			onClick={toggle}
			{...props}
		>
			{fullscreen ? (
				<Icon icon="material-symbols:fullscreen-exit" className="size-8" />
			) : (
				<Icon icon="material-symbols:fullscreen" className="size-8" />
			)}
		</button>
	);
}
