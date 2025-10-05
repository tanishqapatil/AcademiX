const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { default: mongoose } = require('mongoose')
dotenv.config()



const app = express()


app.use(cors())
app.use(express.json())
// server/app.js (or wherever you set routes)
const path = require('path');
const materialRoutes = require('./routes/material');

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // serve files
app.use('/api', materialRoutes); // gives /api/courses/:courseId/materials

const conversionRoutes = require('./routes/conversion');
app.use('/api', conversionRoutes);



app.use('/api/courses', require('./routes/course'));

app.use('/api/auth',require('./routes/auth'))

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/',(req,res) =>{
    res.send("Api is running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})