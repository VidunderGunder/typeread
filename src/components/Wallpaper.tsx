import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { useAtom, useAtomValue } from "jotai";
import { wallpaperAtom } from "@/jotai";

import mushrooms from "@/../assets/images/mushrooms.jpg";
import tree from "@/../assets/images/forest.jpg";
import cafe from "@/../assets/images/cafe.jpg";
import sea from "@/../assets/images/sea.jpg";
import field from "@/../assets/images/field.jpg";
import view from "@/../assets/images/view.jpg";
import volcanic from "@/../assets/images/volcanic.jpg";
import asiaRain from "@/../assets/images/asia-rain.jpg";
import scifi from "@/../assets/images/scifi.jpg";
import fantasy from "@/../assets/images/fantasy.jpg";
import hobbit from "@/../assets/images/hobbit.jpg";

import fireplaceThumbnail from "@/../assets/images/fireplace.jpg";
import fireplaceVideo from "@/../assets/images/fireplace.mp4";

export const wallpaperKeys = [
	"fireplace",
	"mushrooms",
	"tree",
	"cafe",
	"sea",
	"field",
	"view",
	"volcanic",
	"asiaRain",
	"scifi",
	"fantasy",
	"hobbit",
] as const;
export type WallpaperKey = (typeof wallpaperKeys)[number];

const wallpapers = {
	fireplace: {
		thumbnail: fireplaceThumbnail,
		src: fireplaceVideo,
	},
	mushrooms: {
		thumbnail: undefined,
		src: mushrooms,
	},
	tree: {
		thumbnail: undefined,
		src: tree,
	},
	cafe: {
		thumbnail: undefined,
		src: cafe,
	},
	sea: {
		thumbnail: undefined,
		src: sea,
	},
	field: {
		thumbnail: undefined,
		src: field,
	},
	view: {
		thumbnail: undefined,
		src: view,
	},
	volcanic: {
		thumbnail: undefined,
		src: volcanic,
	},
	asiaRain: {
		thumbnail: undefined,
		src: asiaRain,
	},
	scifi: {
		thumbnail: undefined,
		src: scifi,
	},
	fantasy: {
		thumbnail: undefined,
		src: fantasy,
	},
	hobbit: {
		thumbnail: undefined,
		src: hobbit,
	},
} as const satisfies Record<
	WallpaperKey,
	{
		thumbnail?: string;
		src: string;
	}
>;

export type WallpaperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Wallpaper({ className, ...props }: WallpaperProps) {
	const wallpaper = useAtomValue(wallpaperAtom);

	if (!wallpaper) return null;

	let src = "";

	if (wallpaper in wallpapers) {
		src = wallpapers[wallpaper as WallpaperKey].src;
	} else {
		src = wallpaper;
	}

	const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");

	return (
		<div
			className={cn(
				"absolute inset-0 z-0 size-full",
				wallpaper === "fireplace" && "brightness-75",
				className,
			)}
			{...props}
		>
			{isVideo ? (
				<video
					src={src}
					autoPlay
					muted
					loop
					className="absolute size-full object-cover"
				/>
			) : (
				<img
					src={src}
					alt="wallpaper"
					className="absolute size-full object-cover"
				/>
			)}
			<div className="absolute size-full bg-black/40" />
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
				"inset-0 size-full rounded-xl bg-black/60 px-6 py-4 [box-shadow:0_0_0px_2px_rgba(255,255,255,0.05)]",
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
		<div
			className={cn(
				"flex flex-col items-center gap-2 [overflow-y:overlay]",

				"[&::-webkit-scrollbar-thumb]:bg-[#8a8a8aad]",
				"[&::-webkit-scrollbar-thumb]:rounded-full",

				"[&::-webkit-scrollbar-track]:bg-transparent",
				"[&::-webkit-scrollbar-track]:rounded-full",

				"[&::-webkit-scrollbar]:w-1",
				"[&::-webkit-scrollbar]:rounded-full",

				"p-[2px]",

				className,
			)}
			{...props}
		>
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
						"relative aspect-square size-10 min-h-10 cursor-pointer overflow-hidden rounded transition-all duration-200 focus:outline-none",
						wallpaper === key
							? "ring-2 ring-white/75"
							: "opacity-75 hover:opacity-100",
					)}
				>
					<img
						src={wallpapers[key].thumbnail ?? wallpapers[key].src}
						alt={`${key} wallpaper`}
						className="size-full object-cover"
					/>
				</button>
			))}
		</div>
	);
}
