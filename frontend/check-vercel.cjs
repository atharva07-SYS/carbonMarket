const axios = require('axios');
axios.get('https://carbonmarket.vercel.app').then(async r => {
  const matches = r.data.match(/assets\/[a-zA-Z0-9_-]+\.js/g);
  console.log(matches);
  if (!matches) return;
  for (let m of matches) {
    const res = await axios.get('https://carbonmarket.vercel.app/' + m);
    const urls = res.data.match(/https:\/\/[^\"]+\.onrender\.com/g);
    if (urls) console.log(m, [...new Set(urls)]);
    const login = res.data.match(/.{0,50}\/api\/auth\/login.{0,50}/g);
    if(login) console.log(m, login);
  }
});
