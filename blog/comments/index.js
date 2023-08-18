const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const axios = require('axios');

const PORT = 8200;

app.use(express.json());

app.use(bodyParser.json());

app.use(cors());

const comments = {};

app.get('/posts/:id/comments', (req, res) => {
    const { id: postId } = req.params;
    let commentsUnderCurrentPost = comments?.hasOwnProperty(postId) ? comments[postId] : [];
    // console.log('Get the comments under the post with id', postId);
    res.status(200).json({
        message: "Comments retreived successfully",
        data: {
            comments: commentsUnderCurrentPost
        }
    })
});

app.post('/posts/:id/comments', async (req, res) => {
    const { id: postId } = req?.params;
    const { content } = req?.body?.comment;
    const new_comment = {
        _id: uuidv4(),
        content,
        status: "pending"
    };
    //check if the post with the received id exists or not
    if (comments?.hasOwnProperty(postId)) {
        comments[postId].push(new_comment);
    } else {
        comments[postId] = [];
        comments[postId].push(new_comment);
    }

    try {
        //emit the event that new comment has been created
        await axios.post('http://localhost:8500/events', {
            type: 'CommentCreated',
            data: {
                ...new_comment,
                postId
            }
        });
    } catch (error) {
        console.log(error);
    }



    // console.log('Comment created successfully under post with post id as', postId);
    res.status(201).json({
        message: "New comment created successfully",
        data: {
            comment: {
                content
            }
        }
    });
})


//event handler reception
app.post('/events', async (req, res) => {

    try {
        const { event } = req.body;
        // console.log('Received event', event?.type);
        if (event?.type === "CommentModerated") {
            //update the commment and emit event updated event
            //find the target post comment
            let targetComment = comments[event?.data?.postId]
                ?.find(commentItem => commentItem._id === event?.data?._id);
            targetComment.status = event?.data?.status;

            //emit comment update event
            //emit the event that new comment has been created
            await axios.post('http://localhost:8500/events', {
                type: 'CommentUpdated',
                data: {
                    ...targetComment,
                    postId: event?.data?.postId
                }
            });

        }
    } catch (error) {
        console.log(error);
    }



    return res.send({});
});



app.listen(PORT, () => {
    console.log(`Comments microservice is up and running on port ${PORT}`);
});

