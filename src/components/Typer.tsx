import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Toolbar } from "./Toolbar";
import { TyperInput } from "./TyperInput";
import { Results } from "./Results";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Typer({ className, ...props }: TyperProps) {
	return (
		<div
			className={cn(
				"flex size-full select-none flex-col items-center justify-center gap-10 bg-[#232834] text-white focus-visible:outline-none focus-visible:ring-0",
				className,
			)}
			{...props}
		>
			<div className="flex size-full flex-col items-center py-10">
				<Toolbar />
				<div className="flex flex-1 flex-col items-center justify-center gap-10">
					<TyperInput />
					<Results />
				</div>
			</div>
		</div>
	);
}
