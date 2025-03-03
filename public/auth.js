async function initAuth0() {
    // Wait for Auth0 Client to initialize
	try {
		const auth0Client = await auth0.createAuth0Client({
			domain: "dev-16kzyoiz8sa3k8ht.us.auth0.com",
			clientId: "qd9Sjyu0GDTqs3Kj9oLqxUP5zLdz2096",
			authorizationParams: {
				redirect_uri: window.location.origin
			}
		});

		return auth0Client;
	}catch(error){
            return error.message;
      }

	
}


const auth0Client = initAuth0(); // Ensure Auth0 client is ready

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
