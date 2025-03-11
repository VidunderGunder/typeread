import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type LogoProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Logo({ className, ...props }: LogoProps) {
	return (
		<div className={cn("drop-shadow-lg", className)} {...props}>
			<div className="relative flex items-center gap-2 drop-shadow-sm">
				<img src="/android-chrome-192x192.png" alt="Logo" className="size-10" />

				<h1 className="font-black text-2xl">
					<span className="text-white">Type</span>
					<span className="text-red-400">Read</span>
				</h1>

				<span className="absolute bottom-0 left-[0px] size-0 w-max text-center text-white/50">
					<p className="text-[14.6px] leading-[1.2em]">
						Improve typing speed
						<br />
						while enjoying a book
					</p>
				</span>
			</div>
		</div>
	);
}
