import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { muteAtom } from "@/jotai";
import { useAtom } from "jotai";
import { Icon } from "@iconify/react/dist/iconify.js";

export type AudioToggleButtonProps = {
	//
} & Omit<ComponentProps<"button">, "children">;

export function AudioToggleButton({
	className,
	...props
}: AudioToggleButtonProps) {
	const [mute, setMute] = useAtom(muteAtom);

	return (
		<button
			type="button"
			onClick={() => {
				setMute(!mute);
			}}
			className={cn(
				"flex size-11 cursor-pointer items-center justify-center gap-1 rounded-xl hover:bg-white/10",
				className,
			)}
			title={mute ? "Unmute" : "Mute"}
			{...props}
		>
			{mute ? (
				<Icon icon="ri:volume-mute-fill" className="size-7" />
			) : (
				<Icon icon="ri:volume-up-fill" className="size-7" />
			)}
		</button>
	);
}
