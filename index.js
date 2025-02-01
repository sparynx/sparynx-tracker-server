require('dotenv').config()
const express = require('express');
const nodemailer = require("nodemailer");


const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: ["https://sparynxbudgetapp.vercel.app"],
    credentials: true
}));


// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // Your Gmail App Password
    },
  });


  // Route to send email
  app.post("/send-email", async (req, res) => {
    console.log("Email Request Data:", req.body);  // ✅ Log incoming data
  
    try {
      const { email, budgetName, amount, deadline } = req.body;
  
      if (!email || !budgetName || !amount || !deadline) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // ✅ Example: Using Nodemailer
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Budget Reminder: ${budgetName}`,
        text: `Hello, your budget '${budgetName}' of ₦${amount} is due on ${deadline}. Don't forget!`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("❌ Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });
  


const userRoutes = require("./src/users/user.route")
const budgetRoutes = require("./src/budget/budget.route")



app.use("/api/auth", userRoutes);
app.use("/api", budgetRoutes)




async function main() {
    await mongoose.connect(process.env.DB_URI);

    app.use("/", (req, res) => {
        res.send('sparynx server is listening');
    })
}


main().then(() => console.log("mongodb connected to database succesfully")).catch(err => console.log(err));


app.listen(port, () => {
    console.log(`listening on port ${port}`)
});