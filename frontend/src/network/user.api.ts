import { User } from "../models/user.model";


async function fetchData(input: RequestInfo, init?: RequestInit) {
    const response = await fetch(input, init);

    if (response.ok) {
        return response
    } else {
        const errorBody = await response.json();
        const errorMessage = errorBody.message;
        throw Error(errorMessage);
    }
};


export async function getLoggedInUser(): Promise<User> {
    const response = await fetchData("/api/users", { method: "GET" });
    return response.json();
};


export interface SignUpCredentials {
    username: string;
    email: string;
    passwort: string;
};
export async function signUp(credentials: SignUpCredentials): Promise<User> {
    const response = await fetchData("/api/users/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    return response.json();
};


export interface LoginCredentials {
    username: string;
    passwort: string;
};
export async function login(credentials: LoginCredentials): Promise<User> {
    const response = await fetchData("/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    return response.json();
};


export async function logout() {
    await fetchData("/api/users/logout", { method: "POST" });
};


export async function saveTurnier(turnierId: string) {
    await fetchData("/api/users/saveturnier/" + turnierId, { method: "PUT" });
}


export async function unsaveTurnier(turnierId: string) {
    await fetchData("/api/users/unsaveturnier/" + turnierId, { method: "PUT" });
}