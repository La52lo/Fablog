//import { createAuth0Client } from "../node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.production.js";

let auth0Client;

export async function initAuth() {
    auth0Client = await createAuth0Client({
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });
}

export async function login() {
    await auth0Client.loginWithRedirect();
}

export async function logout() {
    await auth0Client.logout({ returnTo: window.location.origin });
}

export async function getUser() {
    return await auth0Client.getUser();
}

export async function getToken() {
    return await auth0Client.getTokenSilently();
}


