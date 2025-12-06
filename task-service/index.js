const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqp = require('amqplib');


const app = express()
const PORT = process.env.PORT || '3001'


app.use(bodyParser.json());


mongoose.connect('mongodb://mongo:27017/tasks')
    .then(() => console.log("Connected to Mongodb"))
    .catch(err => console.error("MongoDb Connection Error", err)
    );


const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Task = mongoose.model('Task', TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
    while (retries) {
        try {
            connection = await amqp.connect('amqp://rabbitmq');
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            console.log("Connected to rabbitMQ");
            return;
        } catch (error) {
            console.error("Rabbit MQ connection error: ", error.message);
            retries--;
            console.error("Retrying...: ", retries);
            await new Promise(res => setTimeout(res, delay));
            
        }
    }
}


app.post('/task', async(req, res) => {
    const { title, description, userId} = req.body;

    try {
        const task = new Task({title, description, userId})
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.log('Error creating task', error);
        res.status(500).json({message: 'Internal Server error'});
    }

});

app.get('/task', async(req, res) => {
    const task = await Task.find()
    res.json(task);
})

app.listen(PORT, () => {
    console.log(`Task Service is Listening on PORT: ${PORT} `);
    
})