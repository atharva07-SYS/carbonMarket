const mongoose = require('mongoose');

const uri = "mongodb://20kidzzz26_db_user:CLtsOCODXpNCvVMP@ac-nqmqcou-shard-00-00.v5cleb2.mongodb.net:27017,ac-nqmqcou-shard-00-01.v5cleb2.mongodb.net:27017,ac-nqmqcou-shard-00-02.v5cleb2.mongodb.net:27017/carbonmarket?ssl=true&replicaSet=atlas-nqmqcou-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully bypassing SRV!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
