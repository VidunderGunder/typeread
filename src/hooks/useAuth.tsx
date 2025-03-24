import { atom, useAtom } from "jotai";
import { useEffect } from "react";

export type User = {
	RawData: Record<string, unknown>;
	Provider: string;
	Email: string;
	Name: string;
	FirstName: string;
	LastName: string;
	NickName: string;
	Description: string;
	UserID: string;
	AvatarURL: string;
	Location: string;
	AccessToken: string;
	AccessTokenSecret: string;
	RefreshToken: string;
	ExpiresAt: Date;
	IDToken: string;
};

export type Auth = {
	isAuthenticated: boolean;
	code?: string;
	token?: string;
	state?: string;
	error?: string;
};

const authAtom = atom<Auth>({ isAuthenticated: false });
// const userAtom = atom<User | null>(null);

export function useAuth() {
	const [auth, setAuth] = useAtom(authAtom);

	console.log(auth);

	useEffect(() => {
		setAuth((prev) => {
			const newAuth = { ...prev };

			console.log("COOKIE", document.cookie);

			function getCookie(key: string) {
				const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
				return b ? b.pop() : "";
			}

			console.log(getCookie("_gothic_session"));

			const cookieEntry = document.cookie
				.split("; ")
				.find((row) => row.startsWith("_gothic_session="));
			if (cookieEntry) {
				const cookieValue = cookieEntry.split("=")[1];
				newAuth.isAuthenticated = true;
				newAuth.token = cookieValue;
			}

			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			const state = params.get("state");

			const allParamKeys = params.keys();
			const allParams = [];

			for (const key of allParamKeys) {
				allParams.push(`${key}: ${params.get(key)}`);
			}

			if (state && code) {
				newAuth.isAuthenticated = true;
				newAuth.code = code;
				newAuth.state = state;
			}

			// window.history.replaceState({}, document.title, window.location.pathname);

			return newAuth;
		});
	}, [setAuth]);

	return auth;
}

export function signin() {
	window.location.href = "http://localhost:8888/login?provider=google";
}

export function signout() {
	window.location.href = "http://localhost:8888/logout?provider=google";
}
