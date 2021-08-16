const express = require("express");
const app = express();
const port = 5000;

const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const MyContract = require("../frontend/build/contracts/MyContract.json");

app.get("/", async (req,res) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = MyContract.networks[networkId];
    const myContract = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork && deployedNetwork.address
    );
    console.log('This is working');
    myContract.events.TaskCreated({})
        .on('data', async function(event){
            const datum = event.returnValues['1'];
            console.log(datum);
        })
        .on('error', console.error);
    res.send("Hello World!");
})

app.listen(port, () => console.log(`Server listening on port ${port}!`));