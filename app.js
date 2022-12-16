const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api')

const app = express();


const PORT = process.env.PORT
const DB_STRING = process.env.DB_STRING

mongoose.set("strictQuery", false);
mongoose.connect(
  DB_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(apiRoutes);

app.listen(PORT, () => console.log(`API listening at http://localhost:${PORT}!`))