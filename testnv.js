const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
fetch("https://integrate.api.nvidia.com/v1/models", { headers: {"Authorization": "Bearer nvapi-test"} }).then(r=>r.text()).then(console.log);
