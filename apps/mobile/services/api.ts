import { ApiResponse } from "@evergreen/shared-types";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(
	/\/$/,
	""
);

const DEFAULT_HEADERS = {
	"Content-Type": "application/json",
};

function isApiResponse<T>(payload: ApiResponse<T> | T): payload is ApiResponse<T> {
	return (
		typeof payload === "object" &&
		payload !== null &&
		"success" in payload
	);
}

export async function getApiData<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		headers: {
			...DEFAULT_HEADERS,
			...(init?.headers ?? {}),
		},
	});

	const payload = (await response.json()) as ApiResponse<T> | T;

	if (!response.ok) {
		if (isApiResponse(payload)) {
			throw new Error(payload.error ?? "Request failed");
		}
		throw new Error("Request failed");
	}

	if (isApiResponse(payload)) {
		if (!payload.success) {
			throw new Error(payload.error ?? "Request failed");
		}
		if (payload.data === undefined) {
			throw new Error("Empty response");
		}
		return payload.data;
	}

	return payload as T;
}
