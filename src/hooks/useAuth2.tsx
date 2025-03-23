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
		enabled: status === "authenticated",
	});

	const { resetQueries } = useQueryClient();
	useEffect(() => {
		async function getUser() {
			const cookie = Cookies.get("refresh_token");
			if (!token && status === "unauthenticated" && !isPending && cookie) {
				setStatus("loading");
				const access_token = await mutateAsync({});
				if (access_token) {
					setStatus("authenticated");
					setToken(access_token);
				}
			} else if (!cookie) {
				setStatus("unauthenticated");
				setToken(undefined);
				resetQueries(api.queryOptions("get", "/me"));
			}
		}
		getUser();
	}, [token, status, isPending, mutateAsync, resetQueries]);

	const signin = useCallback((provider = "google") => {
		window.location.href = `http://localhost:8888/auth/login?provider=${provider}`;
	}, []);

	const { mutate } = api.useMutation("post", "/logout", {
		onSuccess: () => {
			setToken(undefined);
			setStatus("unauthenticated");
			Cookies.remove("refresh_token");
			resetQueries(api.queryOptions("get", "/me"));
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
