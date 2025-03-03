
let auth0Client; // Global variable for Auth0 client

// Initialize Auth0 Client
async function initAuth0() {
    auth0Client = await auth0.createAuth0Client({
        domain: "dev-16kzyoiz8sa3k8ht.us.auth0.com",
		clientId: "qd9Sjyu0GDTqs3Kj9oLqxUP5zLdz2096",
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });

    checkUser(); // Check authentication status after initializing Auth0
}

// Login Function
async function login() {
    await auth0Client.loginWithRedirect();
}

// Logout Function
async function logout() {
    await auth0Client.logout({ returnTo: window.location.origin });
}

// Check User Authentication Status
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

// Initialize authentication on page load
window.onload = initAuth0;

// Attach event listeners to buttons
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("logout-btn").addEventListener("click", logout);
