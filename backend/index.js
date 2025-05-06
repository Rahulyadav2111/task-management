const express = require('express');
const connectDB = require('./db/DBconnect');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors({
    origin:"https://task-management-drab-nine.vercel.app",
    credentials:true,
}));

connectDB();
app.use(express.json());

app.get("/", (req , res)=>{
    res.send("Hello Backend");
})

app.use('/api/auth', authRoutes)
app.use("/api/tasks", taskRoutes);

app.listen(5000, ()=>{
    console.log(`app is running on 5000`);
})