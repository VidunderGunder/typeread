import {
	createContext,
	use,
	useCallback,
	useContext,
	useEffect,
	useRef,
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
	const [error, setError] = useState(false);

	const { data: user, refetch: fetchUser } = api.useQuery("get", "/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		enabled: false,
	});

	const { resetQueries } = useQueryClient();

	const getToken = useCallback(async () => {
			setStatus("loading");
			try {
			const res = await fetch("http://localhost:8888/auth/refresh", {
				method: "GET",
				credentials: "include",
			});
				const { access_token, expires_in } = (await res.json()) as {
					access_token: string;
					expires_in: number;
				};
				if (access_token) {
					setStatus("authenticated");
					setToken(access_token);
					fetchUser();
					return expires_in;
				}

				setStatus("unauthenticated");
				setToken(undefined);
			} catch {
				setStatus("unauthenticated");
				setToken(undefined);
				setError(true);
			}
	}, [ fetchUser]);
	

	useEffect(() => {
		getToken().then((expires) => {
			if (expires) {
				const timer = setInterval(
					() => {
						getToken();
					},
					(expires - 60) * 1000,
				);
				return () => {
					clearInterval(timer);
				};
			}
		});
	}, [getToken]);

	const signin = useCallback((provider = "google") => {
		window.location.href = `http://localhost:8888/auth?provider=${provider}`;
	}, []);

	const { mutate } = api.useMutation("post", "/logout", {
		onSuccess: () => {
			setToken(undefined);
			setStatus("unauthenticated");
			localStorage.removeItem("token");
			// resetQueries(api.queryOptions("get", "/me"));
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
