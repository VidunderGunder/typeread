import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/reset.css";
import "@/styles/styles.css";
import "@/styles/tailwind.css";
import { App } from "./App";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthContextProvider } from "./hooks/useAuth";

if (import.meta.env.DEV) {
	import("react-scan").then(({ scan }) => {
		scan();
	});
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
		},
	},
});

const persister = createSyncStoragePersister({
	storage: window.localStorage,
});

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(
		<StrictMode>
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={{ persister }}
			>
				<AuthContextProvider>
					<App />
					{import.meta.env.DEV && (
						<div className="absolute top-16 right-[5px]">
							<ReactQueryDevtools buttonPosition="relative" />
						</div>
					)}
				</AuthContextProvider>
			</PersistQueryClientProvider>
		</StrictMode>,
	);
}
