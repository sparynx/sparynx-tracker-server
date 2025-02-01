const express = require('express');

require('dotenv').config()

const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: ["https://sparynxbudgetapp.vercel.app"],
    credentials: true
}));



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