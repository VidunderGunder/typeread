import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtom, useAtomValue } from "jotai";
import { wallpaperAtom } from "@/jotai";

import treeSrc from "@/../assets/images/forest.jpg";
import citySrc from "@/../assets/images/sea.jpg";
import seaSrc from "@/../assets/images/city.jpg";

export const wallpaperKeys = ["tree", "city", "sea"] as const;
export type WallpaperKey = (typeof wallpaperKeys)[number];

const wallpapers = {
	tree: treeSrc,
	city: citySrc,
	sea: seaSrc,
} as const satisfies Record<WallpaperKey, string>;

export type WallpaperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Wallpaper({ className, ...props }: WallpaperProps) {
	const wallpaper = useAtomValue(wallpaperAtom);

	if (!wallpaper) return null;

	let src = "";

	if (wallpaper in wallpapers) {
		src = wallpapers[wallpaper as WallpaperKey];
	} else {
		src = wallpaper;
	}

	return (
		<div className={cn("absolute inset-0 z-0 size-full", className)} {...props}>
			<img
				src={src}
				alt="wallpaper"
				className="absolute size-full object-cover"
			/>
			<div className="absolute size-full bg-black/50" />
		</div>
	);
}

export function WallpaperTyperBackdrop({
	className,
	children,
	...props
}: ComponentProps<"div">) {
	const wallpaper = useAtomValue(wallpaperAtom);

	if (!wallpaper) return children;

	return (
		<div
			className={cn(
				"inset-0 size-full rounded-xl bg-black/50 px-6 py-4 [box-shadow:0_0_0px_2px_rgba(255,255,255,0.05)]",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function WallpaperSelect({
	className,
	...props
}: ComponentProps<"div">) {
	const [wallpaper, setWallpaper] = useAtom(wallpaperAtom);

	return (
		<div className={cn("flex items-center gap-2", className)} {...props}>
			{wallpaperKeys.map((key) => (
				<button
					type="button"
					key={key}
					onClick={() => {
						if (key === wallpaper) {
							setWallpaper("");
							return;
						}
						setWallpaper(key);
					}}
					className={cn(
						"relative h-10 w-10 cursor-pointer overflow-hidden rounded transition-all duration-200 focus:outline-none",
						wallpaper === key
							? "ring-2 ring-white/75"
							: "opacity-75 hover:opacity-100",
					)}
				>
					<img
						src={wallpapers[key]}
						alt={`${key} wallpaper`}
						className="h-full w-full object-cover"
					/>
				</button>
			))}
		</div>
	);
}
