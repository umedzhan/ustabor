async function runTest() {
    try {
        console.log("--- 1. FIRST LOGIN ---");
        let login1 = await fetch('http://localhost:5000/api/auth/dev-login');
        let token1 = (await login1.json()).token;

        console.log("--- 2. SET ROLE TO VENDOR ---");
        let role1 = await fetch('http://localhost:5000/api/user/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
            body: JSON.stringify({ role: 'vendor' })
        });
        let r1Data = await role1.json();
        let vendorToken = r1Data.token;
        console.log("Vendor set:", role1.status);

        console.log("--- 3. LOGOUT ---");
        let logoutRes = await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${vendorToken}` }
        });

        console.log("--- 4. SECOND LOGIN (like AuthContext) ---");
        let login2 = await fetch('http://localhost:5000/api/auth/dev-login');
        let token2 = (await login2.json()).token;

        console.log("--- 5. SET ROLE TO VENDOR AGAIN ---");
        let role2 = await fetch('http://localhost:5000/api/user/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
            body: JSON.stringify({ role: 'vendor' })
        });
        console.log("Status:", role2.status, "Data:", await role2.json());

        console.log("--- 6. LOGOUT 2 ---");
        let logoutRes2 = await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${(await role2.json())?.token || token2}` }
        });

        console.log("--- 7. SET ROLE TO ADMIN ---");
        let login3 = await fetch('http://localhost:5000/api/auth/dev-login');
        let token3 = (await login3.json()).token;
        let role3 = await fetch('http://localhost:5000/api/user/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token3}` },
            body: JSON.stringify({ role: 'admin' })
        });
        console.log("Admin Status:", role3.status, "Data:", await role3.json());

    } catch (e) { console.error("ERR", e); }
}
runTest();
