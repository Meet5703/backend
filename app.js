const express = require("express");
const cors = require("cors");
const phonePePayment = require("./routes/index"); // Adjust the path accordingly

const app = express();

app.use(cors());
app.use(express.json());

// Include other middleware and routes as needed

// Include the PhonePe payment logic
app.use(phonePePayment); // This line is including your router

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
