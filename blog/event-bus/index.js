const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { default: axios } = require('axios');
const app = express();
const PORT = 8500;

app.use(express.json());

app.use(bodyParser.json());

app.use(cors());

const events = [];

app.post('/events', async (req, res) => {
    const event = req.body;

    //push the received event into the events store
    events?.push(event);

    try {
        //send event to posts service
        await axios.post('http://localhost:8100/events', { event });
    } catch (error) {
        console.log(error);
    }

    try {
        //send event to comments service
        await axios.post('http://localhost:8200/events', { event });
    } catch (error) {
        console.log(error);
    }

    try {
        //send event to query service
        await axios.post('http://localhost:8300/events', { event });
    } catch (error) {
        console.log(error);
    }

    try {
        //send event to moderation service
        await axios.post('http://localhost:8600/events', { event });
    } catch (error) {
        console.log(error);
    }


    return res.send({
        status: 'OK'
    });

});

app.get('/events', (req, res) => {
    return res.status(200).json({
        message: "All the events so far",
        events
    });
})


app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));