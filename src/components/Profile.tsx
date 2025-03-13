import { useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Command } from "./Command";
import { mod } from "@/types/keyboard";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal } from "./Modal";
import { useAtom } from "jotai";
import { type SearchEngine, searchEngineAtom, searchEngines } from "@/jotai";

export type ProfileProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Profile({ className, ...props }: ProfileProps) {
	const isSignedIn = true;

	const [open, setOpen] = useState(false);

	return (
		<div
			className={cn("flex w-full flex-col items-stretch", className)}
			{...props}
		>
			<Command
				label={isSignedIn ? "User Profile" : "Sign in"}
				flip
				modifiers={[mod]}
				keyboard_key="KeyU"
				handler={() => {
					setOpen((prev) => !prev);
				}}
			/>
			<Modal
				open={open}
				onOpenChange={setOpen}
				header={
					<>
						<Icon icon="gridicons:user" />
						{isSignedIn ? "User Profile" : "Sign in"}
					</>
				}
				footer={
					<div className="flex justify-end p-4">
						<Command
							label="Sign out"
							flip
							keyboard_key="KeyO"
							handler={() => {
								alert("TODO");
							}}
						/>
					</div>
				}
			>
				<SearchEngineSelect />
			</Modal>
		</div>
	);
}

type SearchEngineSelectProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

const engineIconifyIcons = {
	Google: "logos:google-icon",
	Bing: "logos:bing",
	DuckDuckGo: "logos:duckduckgo",
	Brave: "logos:brave",
	Yahoo: "logos:yahoo",
} as const satisfies Record<SearchEngine, string>;

function SearchEngineSelect({ className, ...props }: SearchEngineSelectProps) {
	const [searchEngine, setSearchEngine] = useAtom(searchEngineAtom);

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<label className="flex flex-col gap-1 font-semibold text-sm">
				Search Engine
				<span className="font-normal text-gray-400 text-xs leading-1">
					Select your preferred search engine
				</span>
			</label>
			<div className="flex flex-col gap-0.5">
				{searchEngines.map((engine) => (
					<button
						type="button"
						key={engine}
						className={cn(
							"flex not-disabled:cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 font-semibold text-sm hover:bg-white/10",
						)}
						onClick={() => {
							setSearchEngine(engine);
						}}
					>
						<span className="flex items-center gap-2">
							<Icon
								icon={engineIconifyIcons[engine]}
								className="aspect-square size-[1rem]"
							/>
							{engine}
						</span>
						{searchEngine === engine && (
							<Icon icon="ion:checkmark" className="text-lg" />
						)}
					</button>
				))}
			</div>
		</div>
	);
}
