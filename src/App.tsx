import { Toolbar } from "@/components/Toolbar";
import { Typer } from "@/components/Typer";
import { Results } from "@/components/Results";
import { useEffect } from "react";
import { useInit } from "@/jotai";
import { WPM } from "@/components/WPM";
import { UploadAfter } from "@/components/Upload";
import { BookTitle } from "@/components/BookTitle";
import { Hotkeys } from "@/components/Hotkeys";
import { cn } from "@/styles/utils";
import { Wallpaper, WallpaperSelect } from "@/components/Wallpaper";
import { Fullscreen } from "./components/Fullscreen";
import { Logo } from "./components/Logo";

export function App() {
	const { init } = useInit();

	useEffect(() => {
		init();
	}, [init]);

	return (
		<>
			<div className="absolute size-full bg-[#13161c]" />
			<Wallpaper />
			<div
				className={cn(
					"relative flex size-full select-none flex-col items-center justify-center gap-10 text-white focus-visible:outline-none focus-visible:ring-0",
					"backdrop-blur-sm",
				)}
			>
				<div className="z-0 flex size-full flex-col items-center py-3">
					<Toolbar className="z-0" />
					<BookTitle className="absolute top-[65px]" />
					<div className="pointer-events-none z-10 flex flex-1 flex-col items-center justify-center gap-10">
						<WPM className="pointer-events-auto" />
						<div>
							<Typer className="pointer-events-auto" />
						</div>
						<Results className="pointer-events-auto" />
					</div>
				</div>
				<Logo className="absolute top-4 left-5" />
				<Fullscreen className="absolute top-3 right-3" />
				<UploadAfter className="absolute bottom-3" />
				<Hotkeys className="absolute right-3 bottom-3" />
				<WallpaperSelect className="absolute bottom-4 left-4" />
			</div>
		</>
	);
}
