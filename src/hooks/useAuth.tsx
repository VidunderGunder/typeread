import { atom, useAtom } from "jotai";
import { useEffect } from "react";



export type AuthState = {
	isAuthenticated: boolean;
	token?: string;
	user?: unknown; // TODO
	error?: string;
};

const authAtom = atom<AuthState>({ isAuthenticated: false });

export function useAuth() {
	const [auth, setAuth] = useAtom(authAtom);

	useEffect(() => {
		const cookieEntry = document.cookie
			.split("; ")
			.find((row) => row.startsWith("_gothic_session="));
		if (cookieEntry) {
			const cookieValue = cookieEntry.split("=")[1];
			setAuth((prev) => ({
				...prev,
				isAuthenticated: true,
				token: cookieValue,
			}));
		}

		const params = new URLSearchParams(window.location.search);
		const state = params.get("state");
		const code = params.get("code");

		const allParamKeys = params.keys();
		const allParams = [];

		for (const key of allParamKeys) {
			allParams.push(`${key}: ${params.get(key)}`);
		}

		if (state && code) {
			setAuth((prev) => ({ ...prev, isAuthenticated: true, token: code }));

			// window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, [setAuth]);

	return auth;
}

// http://localhost:5173/?state=R2hCi6gsUP_SufD7G-DaNvBIXOupHRY47Tzm0sBvHMwoP8tFNfd40b9iGogpYg-pXlXBjLTwi4sdmLj-Hu3j-w%3D%3D&code=4%2F0AQSTgQHepufgBG8aQo0mjKS5dyR2uUBfBruVrljLx3wdT9vx2r26H3O2_3i-lq7eRxtytA&scope=email+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=0&prompt=none

export function signin() {
	window.location.href = "http://localhost:8888/login?provider=google";
}

export function signout() {
	window.location.href = "http://localhost:8888/logout?provider=google";
}
