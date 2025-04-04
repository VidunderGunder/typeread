import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { mutePreferenceAtom } from "@/jotai";
import { useAtom } from "jotai";
import { Icon } from "@iconify/react/dist/iconify.js";

export type AudioToggleButtonProps = {
	//
} & Omit<ComponentProps<"button">, "children">;

export function AudioToggleButton({
	className,
	...props
}: AudioToggleButtonProps) {
	const [mutePreference, setMutePreference] = useAtom(mutePreferenceAtom);

	return (
		<button
			type="button"
			onClick={() => {
				setMutePreference(!mutePreference);
			}}
			className={cn(
				"flex size-11 cursor-pointer items-center justify-center gap-1 rounded-xl hover:bg-white/10",
				className,
			)}
			title={mutePreference ? "Unmute" : "Mute"}
			{...props}
		>
			{mutePreference ? (
				<Icon icon="ri:volume-mute-fill" className="size-6" />
			) : (
				<Icon icon="ri:volume-up-fill" className="size-6" />
			)}
		</button>
	);
}
