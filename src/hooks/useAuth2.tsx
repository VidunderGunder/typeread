import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { components } from "../api/schema";
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
	const [status, setStatus] = useState<AuthState["status"]>("loading");
	const [token, setToken] = useState<string | undefined>();

	const { isPending, mutateAsync } = api.useMutation("post", "/auth/refresh", {
		onError: () => {
			setToken(undefined);
			setStatus("unauthenticated");
			localStorage.removeItem("token");
		},
	});

	const { data: user } = api.useQuery("get", "/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		enabled: status === "authenticated" && !!token,
	});

	const { resetQueries } = useQueryClient();
	useEffect(() => {
		async function getUser() {
			if (!token && status === "loading" && !isPending) {
				setStatus("loading");
				const { access_token } = await mutateAsync({ credentials: "include" });
				console.log("access_token", access_token);
				if (access_token) {
					console.log("access_token", access_token);
					setStatus("authenticated");
					setToken(access_token);
					localStorage.setItem("token", access_token);
				} else {
					setStatus("unauthenticated");
					setToken(undefined);
					setStatus("unauthenticated");
					localStorage.removeItem("token");
				}
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
