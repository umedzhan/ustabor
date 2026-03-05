async function runTest() {
    try {
        console.log("--- 1. FIRST LOGIN ---");
        let login1 = await fetch('http://localhost:5000/api/auth/dev-login');
        let token1 = (await login1.json()).token;
        console.log("Token1:", token1.substring(0, 15));

        console.log("--- 2. SET ROLE TO VENDOR ---");
        let role1 = await fetch('http://localhost:5000/api/user/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
            body: JSON.stringify({ role: 'vendor' })
        });
        let r1Data = await role1.json();
        console.log("Status:", role1.status, "Data:", r1Data);
        let vendorToken = r1Data.token;

        console.log("--- 3. LOGOUT ---");
        let logoutRes = await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${vendorToken}` }
        });
        console.log("Logout status:", logoutRes.status);

        console.log("--- 4. SECOND LOGIN (like AuthContext after logout) ---");
        let login2 = await fetch('http://localhost:5000/api/auth/dev-login');
        let token2 = (await login2.json()).token;
        console.log("Token2:", token2.substring(0, 15));

        console.log("--- 5. SET ROLE TO CLIENT ---");
        let role2 = await fetch('http://localhost:5000/api/user/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
            body: JSON.stringify({ role: 'client' })
        });
        console.log("Status:", role2.status, "Data:", await role2.json());

    } catch (e) { console.error("ERR", e); }
}
runTest();
