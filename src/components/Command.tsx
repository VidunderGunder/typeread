import { cn } from "@/styles/utils";
import {
	type Modifier,
	type KeyboardKey,
	hotkeyModifiers,
	hotkeyKeys,
	hotkeyKeyWebToMantine,
	isHotkeyModifier,
	isSafeHotkeyKey,
	hotkeyModifierWebToMantine,
} from "@/types/keyboard";
import {
	type ReactNode,
	type ComponentProps,
	Fragment,
	useState,
	useEffect,
} from "react";
import {
	getLabelFromCode,
	Keyboard,
	KeyboardBase,
	type KeyboardProps,
	useKeyboard,
	useModifiers,
} from "./Keyboard";
import { type HotkeyItem, useHotkeys } from "@mantine/hooks";
import { disableEscapeAtom } from "@/jotai";
import { useSetAtom } from "jotai";

export type Hotkey = {
	modifiers: Modifier[];
	keyboard_key: KeyboardKey;
};

export function isEqualHotkey(a: Hotkey, b: Hotkey): boolean {
	if (a.modifiers.length !== b.modifiers.length) return false;
	if (a.keyboard_key !== b.keyboard_key) return false;

	for (let i = 0; i < a.modifiers.length; i++) {
		const modifier = a.modifiers[i];
		if (!modifier || !b.modifiers.includes(modifier)) {
			return false;
		}
	}

	return true;
}

export type CommandType = Partial<Hotkey> & {
	label: ReactNode;
	disabled?: boolean;
	handler?: (event?: KeyboardEvent) => void;
};

export type CommandProps = {
	flip?: boolean;
} & Partial<CommandType> &
	Omit<ComponentProps<"button">, "label" | "children">;

export function Command({
	disabled = false,
	className,
	modifiers = [],
	keyboard_key = "",
	handler,
	flip = false,
	label,
	...props
}: CommandProps) {
	const { Alt, Control, Meta, Shift } = useModifiers();

	const setDisableEscape = useSetAtom(disableEscapeAtom);
	const isEscape = keyboard_key === "Escape";

	useEffect(() => {
		if (isEscape) {
			if (disabled) {
				setDisableEscape(false);
			} else {
				setDisableEscape(true);
			}
			return () => {
				setDisableEscape(false);
			};
		}
	}, [disabled, setDisableEscape, isEscape]);

	let irrelevant = disabled;

	if (Alt && !modifiers.includes("Alt")) {
		irrelevant = true;
	}

	if (!irrelevant && Control && !modifiers.includes("Control")) {
		irrelevant = true;
	}

	if (!irrelevant && Meta && !modifiers.includes("Meta")) {
		irrelevant = true;
	}

	if (!irrelevant && Shift && !modifiers.includes("Shift")) {
		irrelevant = true;
	}

	const isLikelyValidHotkey =
		modifiers.length > 0
			? !modifiers.some((m) => !isHotkeyModifier(m)) &&
				isSafeHotkeyKey(keyboard_key)
			: typeof keyboard_key === "string";

	const hotkeyItems: HotkeyItem[] =
		!disabled && handler && isLikelyValidHotkey
			? [
					[
						[
							...modifiers
								.map((m) => {
									if (!isHotkeyModifier(m)) return;
									return hotkeyModifierWebToMantine[m];
								})
								.filter(Boolean),
							isSafeHotkeyKey(keyboard_key)
								? hotkeyKeyWebToMantine[keyboard_key]
								: keyboard_key,
						].join("+"),
						handler,
					],
				]
			: [];

	return (
		<button
			className={cn(
				"flex items-center gap-1.5",
				flip && "flex-row-reverse",
				irrelevant ? "opacity-80" : "opacity-100",
				"not-disabled:cursor-pointer rounded-lg px-2.5 py-1 not-disabled:hover:bg-white/10",
				flip ? "pr-1" : "pl-1",
				"font-semibold text-sm text-white/75",
				className,
			)}
			type="button"
			disabled={disabled}
			onClick={() => {
				if (disabled) return;
				handler?.();
			}}
			{...props}
		>
			{!disabled && <UseHotkey hotkeyItems={hotkeyItems} />}
			<div className="flex gap-[1px]">
				{modifiers.map((code) => (
					<Keyboard key={code} interactive={!irrelevant} code={code} />
				))}
				{keyboard_key && (
					<Keyboard
						key={keyboard_key}
						interactive={!irrelevant}
						code={keyboard_key}
					/>
				)}
			</div>
			{label && <span>{label}</span>}
		</button>
	);
}

/**
 * Component to be able to conditionally run hotkey assignemnts
 */
export function UseHotkey({
	hotkeyItems,
	tagsToIgnore = [],
	triggerOnContentEditable,
}: {
	hotkeyItems: HotkeyItem[];
	tagsToIgnore?: string[];
	triggerOnContentEditable?: boolean;
}) {
	useHotkeys(hotkeyItems, tagsToIgnore, triggerOnContentEditable);
	return null;
}

export function CommandSeparator({
	className,
	vertical = false,
	...props
}: ComponentProps<"div"> & {
	vertical?: boolean;
}) {
	return (
		<div
			className={cn(
				vertical
					? "h-[1px] w-[1.1rem] bg-white/50"
					: "h-[1.1rem] w-[1px] bg-white/50",
				className,
			)}
			{...props}
		/>
	);
}

export type CommandsProps = {
	disabled?: boolean;
	commands: (Omit<CommandProps, "label" | "keyboard_key"> &
		Required<Pick<CommandProps, "label" | "keyboard_key">>)[];
	flip?: boolean;
} & CommandsWrapperProps;

export function Commands({
	disabled = false,
	commands,
	vertical = false,
	className,
	flip = false,
	...props
}: CommandsProps) {
	return (
		<CommandsWrapper {...props}>
			{commands.map((command, i) => {
				const key = [
					...(command.modifiers ?? []),
					command.keyboard_key,
					command.label,
				].join("-");
				return (
					<Fragment key={key}>
						{!vertical && i > 0 && <CommandSeparator />}
						<Command flip={flip} disabled={disabled} {...command} />
					</Fragment>
				);
			})}
		</CommandsWrapper>
	);
}

export type CommandsWrapperProps = ComponentProps<"div"> & {
	vertical?: boolean;
};

export function CommandsWrapper({
	vertical,
	className,
	...props
}: CommandsWrapperProps) {
	return (
		<div
			className={cn(
				"flex",
				vertical ? "flex-col items-end" : "items-center gap-3",
				className,
			)}
			{...props}
		/>
	);
}

type ConfirmProps = {
	onYes: () => void;
	onNo?: () => void;
	onBoth?: () => void;
} & ComponentProps<"div">;

export function Confirm({
	onYes,
	onNo,
	onBoth,
	className,
	...props
}: ConfirmProps) {
	useHotkeys(
		[
			[
				"Y",
				() => {
					onYes?.();
					onBoth?.();
				},
			],
			[
				"N",
				() => {
					onNo?.();
					onBoth?.();
				},
			],
		],
		[],
	);

	return (
		<div className={cn("flex items-center gap-3", className)} {...props}>
			<div className="pr-2 text-sm text-white/75 ">Sure?</div>
			<Commands
				commands={[
					{
						keyboard_key: "KeyY",
						modifiers: [],
						label: "Yes",
					},
					{
						keyboard_key: "KeyN",
						modifiers: [],
						label: "No",
					},
				]}
			/>
		</div>
	);
}

type HotkeyKeyboardProps = {
	onPressDown?: (code: string) => void;
	onPressUp?: (code: string) => void;
} & KeyboardProps;

export function HotkeyKeyboard({
	children,
	code,
	className,
	onPressDown,
	onPressUp,
	...props
}: HotkeyKeyboardProps) {
	const label = children ?? getLabelFromCode(code);
	const { pressed } = useKeyboard(code, {
		onPressDown,
		onPressUp,
	});

	return (
		<KeyboardBase
			className={cn(
				pressed ? "border-gray-300 bg-gray-300" : "hidden",
				className,
			)}
			{...props}
		>
			{label}
		</KeyboardBase>
	);
}

export type HotkeyInputProps = {
	onHotkey: (hotkey: Hotkey) => void;
} & Omit<ComponentProps<"div">, "children">;

export function HotkeyInput({
	className,
	onHotkey,
	...props
}: HotkeyInputProps) {
	const [modifiers, setModifiers] = useState<Modifier[]>([]);
	const [keys, setKeys] = useState<Modifier[]>([]);

	return (
		<div className={cn("flex h-[10px] gap-[1px]", className)} {...props}>
			{modifiers.length === 0 && keys.length === 0 && (
				<span className="text-sm italic opacity-50">
					{" "}
					Press a combination of keys...
				</span>
			)}
			{hotkeyModifiers.map((code) => {
				return (
					<HotkeyKeyboard
						key={code}
						code={code}
						onPressDown={(code) => {
							if (modifiers.includes(code)) return;
							setModifiers((prev) => [...prev, code]);
						}}
						onPressUp={(code) => {
							const index = modifiers.findIndex((m) => m === code);
							if (index === -1) return;
							setModifiers((prev) => prev.toSpliced(index, 1));
						}}
					/>
				);
			})}
			{hotkeyKeys.map((code) => {
				return (
					<HotkeyKeyboard
						key={code}
						code={code}
						onPressDown={(code) => {
							if (keys.includes(code)) return;
							setKeys((prev) => [...prev, code]);
							if (modifiers.length === 0) return;
							onHotkey({
								keyboard_key: code,
								modifiers,
							});
						}}
						onPressUp={(code) => {
							const index = keys.findIndex((m) => m === code);
							if (index === -1) return;
							setKeys((prev) => prev.toSpliced(index, 1));
						}}
					/>
				);
			})}
		</div>
	);
}
