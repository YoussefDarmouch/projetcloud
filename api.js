
require('dotenv').config();


const express = require('express');


const path = require('path');


const app = express();


app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n Serveur web → http://localhost:${PORT}`);
  console.log(`   Ouvrez votre navigateur sur http://localhost:${PORT}\n`);
});