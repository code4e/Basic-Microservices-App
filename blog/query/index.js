const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const PORT = 8300
const app = express();


app.use(express.json());

app.use(bodyParser.json());

app.use(cors());

const postsDetails = {

};

// postsDetails = {
//     "ad1e0231-5650-4c88-bbd3-b3491e75b23a": {
//         "title": "Hey this is post 1",
//         "comments": [
//             {
//                 _id: '90695bfd-ad6f-404b-9fbd-321d6525cf16',
//                 content: 'This is a comment 6',
//                 postId: 'ad1e0231-5650-4c88-bbd3-b3491e75b23a'
//             }, {
//                 _id: '9fdb8354-3119-43b0-bf5f-df8eef969470',
//                 content: 'This is a comment 7',
//                 postId: 'ad1e0231-5650-4c88-bbd3-b3491e75b23a'
//             }
//         ]
//     }
// }


//to get all posts + their associated comments
app.get('/posts', (req, res) => {
    return res.status(200).json({
        message: "Posts and associated comments retrieved successfully",
        data: {
            posts: postsDetails
        }
    });
});

//to receive the event, interpret it, and then store it appropriately
app.post('/events', (req, res) => {
    const { event } = req.body;
    handleEvent(event);

    return res.send({
        status: "OK"
    })

});

async function handleEvent(event) {
    //interpret post creation event
    if (event?.type === "PostCreated") {
        //add the new post to the postDetails data structure
        postsDetails[event?.data?._id] = {
            ...event?.data,
            comments: []
        }
    }
    //interpret comment creation event
    else if (event?.type === "CommentCreated") {
        //get the post and push the new comment in the comments array for that post
        let post = postsDetails[event?.data?.postId];
        post?.comments?.push({
            ...event?.data
        });
    }
    // interpret the comment updation event
    else if (event?.type === "CommentUpdated") {
        //locate the target post comment
        let targetComment = postsDetails[event?.data?.postId]
            ?.comments
            ?.find(commentItem => commentItem?._id === event?.data?._id);
        //update the status of the comment
        targetComment.status = event?.data?.status;
    }
}



app.listen(PORT, async () => {
    console.log('Sucessfully started the query microservice on port', PORT);

    try {
        //handle any pending events when the query service comes online
        let res = await axios.get('http://localhost:8500/events');
        const events = res?.data?.events;
        for(let event of events){
            handleEvent(event);
        }
    } catch (error) {
        console.log(error);
    }

});