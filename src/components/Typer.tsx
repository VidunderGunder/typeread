import {  type ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Typer({ className, ...props }: TyperProps) {
	// TODO
	
	return (
		<div className={cn("", className)} {...props}>
			{/* TODO */}
		</div>
	);
}
