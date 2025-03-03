let auth0Client;

async function initAuth() {
    auth0Client = await createAuth0Client({
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });
}


// Login function
async function login() {
    await auth0Client.loginWithRedirect();
}

// Logout function
async function logout() {
    await auth0Client.logout({ returnTo: window.location.origin });
}

// Check if user is logged in and update UI
async function checkUser() {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
        const user = await auth0Client.getUser();
        document.getElementById("user-info").innerText = `Logged in as: ${user.email}`;
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
    } else {
        document.getElementById("login-btn").style.display = "block";
        document.getElementById("logout-btn").style.display = "none";
    }
}

// Run checkUser on page load
window.onload = checkUser;