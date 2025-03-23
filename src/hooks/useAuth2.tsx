import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { components } from "../api/schema";
import Cookies from "js-cookie";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";

export type User = components["schemas"]["MeBody"];

export type AuthState = {
	status: "loading" | "unauthenticated" | "authenticated";
	user?: User;
	token?: string;
	signin: (provider?: "google") => void;
	signout: () => void;
};

const AuthContext = createContext<AuthState>({
	status: "unauthenticated",
	signin: () => {},
	signout: () => {},
});

export function useAuth() {
	const auth = useContext(AuthContext);

	return { ...auth };
}

export function AuthContextProvider({
	children,
}: { children: React.ReactNode }) {
	const [status, setStatus] = useState<AuthState["status"]>("unauthenticated");
	const [token, setToken] = useState<string | undefined>();

	const { isPending, mutateAsync } = api.useMutation("post", "/auth/refresh");

	const { data: user } = api.useQuery("get", "/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		enabled: status === "authenticated" && !!token,
	});

	console.log("token", token);
	console.log("status", status);

	const { resetQueries } = useQueryClient();
	useEffect(() => {
		async function getUser() {
			const cookie = Cookies.get("refresh_token");
			console.log({
				token,
				status,
				isPending,
				cookie,
			});
			if (!token && status === "unauthenticated" && !isPending && cookie) {
				setStatus("loading");
				const { access_token } = await mutateAsync({});
				if (access_token) {
					console.log("access_token", access_token);
					setStatus("authenticated");
					setToken(access_token);
					localStorage.setItem("token", access_token);
				}
			} else if (!cookie) {
				setStatus("unauthenticated");
				setToken(undefined);
				localStorage.removeItem("token");

				// resetQueries(api.queryOptions("get", "/me"));
			}
		}
		getUser();
	}, [token, status, isPending, mutateAsync, resetQueries]);

	const signin = useCallback((provider = "google") => {
		window.location.href = `http://localhost:8888/auth?provider=${provider}`;
	}, []);

	const { mutate } = api.useMutation("post", "/logout", {
		onSuccess: () => {
			setToken(undefined);
			setStatus("unauthenticated");
			Cookies.remove("refresh_token");
			localStorage.removeItem("token");
			// resetQueries(api.queryOptions("get", "/me"));
			mutate({});
		},
	});

	const signout = useCallback(() => {
		setStatus("loading");
		mutate({});
	}, [mutate]);

	return (
		<AuthContext.Provider value={{ status, token, user, signin, signout }}>
			{children}
		</AuthContext.Provider>
	);
}
