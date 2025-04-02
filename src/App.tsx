import { Toolbar } from "@/components/Toolbar";
import { Typer } from "@/components/Typer";
import { Results } from "@/components/ResultsBottom";
import { UseInit } from "@/jotai";
import { WPM } from "@/components/ResultsTop";
import { UploadAfter } from "@/components/Upload";
import { BookTitle } from "@/components/BookTitle";
import { Hotkeys } from "@/components/Hotkeys";
import { cn } from "@/styles/utils";
import { Wallpaper, WallpaperSelect } from "@/components/Wallpaper";
import { Fullscreen } from "./components/Fullscreen";
import { Logo } from "./components/Logo";

export function App() {
	return (
		<>
			<div className="absolute size-full bg-[#13161c]" />
			<Wallpaper className="blur-[6px]" />
			<div
				className={cn(
					"flex size-full select-none flex-col items-center justify-center gap-10 text-white focus-visible:outline-none focus-visible:ring-0",
				)}
			>
				<div className="flex size-full flex-col items-center py-3">
					<Toolbar className="z-0" />
					<BookTitle className="absolute top-[70px]" />
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
				<WallpaperSelect className="absolute bottom-4 left-4 max-h-[calc(100dvh-120px)]" />
			</div>
			<UseInit />
		</>
	);
}
