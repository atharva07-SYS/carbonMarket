const mongoose = require('mongoose');

const uri = "mongodb+srv://20kidzzz26_db_user:CLtsOCODXpNCvVMP@cluster0.v5cleb2.mongodb.net/?appName=Cluster0";

mongoose.connect(uri, { family: 4 })
  .then(() => {
    console.log("Connected successfully with IPv4 forced!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
