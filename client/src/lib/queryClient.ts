import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { userSession } from "./userSession";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const userId = userSession.getUserId();
  const headers: HeadersInit = {
    "x-user-id": userId,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Update user ID from server response if provided
  const serverUserId = res.headers.get('x-user-id');
  if (serverUserId) {
    userSession.setUserId(serverUserId);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const userId = userSession.getUserId();
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        "x-user-id": userId,
      },
    });

    // Update user ID from server response if provided
    const serverUserId = res.headers.get('x-user-id');
    if (serverUserId) {
      userSession.setUserId(serverUserId);
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
