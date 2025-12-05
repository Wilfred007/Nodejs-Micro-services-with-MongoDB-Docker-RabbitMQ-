const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize DB connection
mongoose.connect('mongodb://mongo:27017/users')
.then(() => console.log('Connected to mongoDb'))
.catch(err => console.log('MongoDB Connection Error', err));

// Create our user schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
});

// Create our user model
const User = mongoose.model('User', UserSchema);


// Create user endpoint
app.post('/users', async(req, res) => {
    const { name, email} = req.body;
    try {
        const user = new User({name, email})
        await user.save();
        res.status(201).json(user)
    } catch (error) {

        console.error('Error creating new user', error);
        res.status(500).json({error: "Internal server error"})
        process.exit(1)
        
        
    }
})

// Get users endpoint
app.get('/users', async(req, res) => {
    const users = await User.find();
    res.json(users);
})


app.get('/', (req, res) => {
    res.send('Server is running fine');
})


app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT} `);
    
})