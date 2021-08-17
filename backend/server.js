const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbConfig = require('./config/database.config.js');
const Data = require('./models/data.model.js');
const mongoose = require('mongoose');

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const MyContract = require("../frontend/build/contracts/MyContract.json");

function rot13(str) {
  var input     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var output    = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
  var index     = x => input.indexOf(x);
  var translate = x => index(x) > -1 ? output[index(x)] : x;
  return str.split('').map(translate).join('');
}

app.get("/", async (req,res) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = MyContract.networks[networkId];
    const myContract = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork && deployedNetwork.address
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log('Server is ready to return data');
    myContract.events.TaskCreated({})
        .on('data', async function(event){
            const datum = event.returnValues['1'];
            const new_datum = rot13(datum);
            console.log("ROT13 data:", new_datum);
            const db_data = new Data({
                content: new_datum
            });
            db_data.save();

            console.log('Loading database');
            
            const intervalId = setInterval(() => {
                Data.find()
                    .then(each_data => {
                        const transformed_data = []
                        for (let i = 0; i < each_data.length; i++) {
                            transformed_data.push(each_data[i].content + " ");
                        };
                        res.write(`data: ${transformed_data}\n\n`);
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "An error occurred while retrieving the database"
                        });
                    });
            }, 1000);

            res.on('close', () => {
                console.log('Client closed connection')
                clearInterval(intervalId)
                res.end()
            });
        })
        .on('error', console.error);
})

const port = 5000;

app.listen(port, () => console.log(`Server listening on port ${port}!`));