const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const axios = require('axios');

const PORT = 8100;

app.use(express.json());

app.use(bodyParser.json());

app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    // console.log('Get all posts');
    return res.status(200).json({
        message: "Posts retrieved successfully",
        data: {
            posts
        }
    });
});

app.post('/posts', async (req, res) => {
    // console.log('Create a new post');
    let { title } = req?.body?.post;
    let _id = uuidv4();
    let new_post = {
        _id,
        title
    }
    posts[_id] = (new_post);

    try {
        //emit an event that a new post is created
        await axios.post('http://localhost:8500/events', {
            type: 'PostCreated',
            data: {
                ...new_post
            }
        })
    } catch (error) {
        console.log(error);
    }


    return res.status(201).json({
        message: "Post created successfully",
        data: {
            new_post
        }
    })
});

//event handler reception
app.post('/events', (req, res) => {
    const { event } = req.body;
    // console.log('Received event', event?.type);

    return res.send({});
});

app.listen(PORT, () => {
    console.log('Sucessfully started the posts microservice on port', PORT);
});