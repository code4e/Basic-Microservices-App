const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const PORT = 8600;
const app = express();

app.use(bodyParser.json());

app.use(express.json());

app.use(cors());

async function handleEvent(event) {
    try {
        //moderate the comment and emit commentModerated event
        if (event?.type === "CommentCreated") {
            //check if the content of the comment contains the word 'orange', if yes, rejected, otherwize approved
            event.data.status = event?.data?.content?.toLowerCase()?.includes("orange") ? "rejected" : "approved";
            await axios.post('http://localhost:8500/events', {
                type: 'CommentModerated',
                data: {
                    ...event?.data
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

app.post('/events', async (req, res) => {
    const { event } = req.body;
    handleEvent(event);

    return res.send({});
});

app.listen(PORT, async () => {
    console.log(`Moderation microservice is up and running on port ${PORT}`);

    try {
        //handle any pending events when the query service comes online
        let res = await axios.get('http://localhost:8500/events');
        const events = res?.data?.events;
        for (let event of events) {
            handleEvent(event);
        }
    } catch (error) {
        console.log(error);
    }
});