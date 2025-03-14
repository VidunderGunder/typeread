import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type LogoProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Logo({ className, ...props }: LogoProps) {
	return (
		<div className={cn("drop-shadow-lg", className)} {...props}>
			<div className="relative flex flex-col justify-center drop-shadow-sm">
				<div className="flex items-center gap-2">
					<img
						src="/android-chrome-192x192.png"
						alt="Logo"
						className="size-9"
					/>

					<h1 className="font-black text-xl">
						<span className="text-white">Type</span>
						<span className="text-red-400">Read</span>
					</h1>
				</div>
				<span className="left-[0px] w-max text-center text-white/50">
					<p className="text-[12.4px] leading-[1.2em]">
						Improve typing speed
						<br />
						while enjoying a book
					</p>
				</span>
				<span className="mt-0.5 text-cyan-400 text-sm">
					[currently in alpha]
				</span>
			</div>
		</div>
	);
}
