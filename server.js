require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

// Init Express Framework
const app = express();

// Server default variables
const PORT = process.env.PORT || 8008;

// Routes middleware
const routes = require("./routes/routes");

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routing
app.use("/api", routes);

app.get("*", (req, res) => {
  res.status(404).send({ message: "Not found (404)" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT} 🚀`);
});
