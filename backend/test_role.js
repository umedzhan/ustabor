async function test() {
    try {
        // 1. Dev login
        const loginRes = await fetch('http://localhost:5000/api/auth/dev-login');
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Logged in, token:", token?.substring(0, 10) + '...');

        // 2. Set role to vendor
        const roleRes = await fetch('http://localhost:5000/api/user/set-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: 'vendor' })
        });
        const roleData = await roleRes.json();
        console.log("Role set status:", roleRes.status);
        console.log("Role set response:", roleData);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
