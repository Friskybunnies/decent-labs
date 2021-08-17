import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { MYCONTRACT_ABI, MYCONTRACT_ADDRESS } from './config';
import TextField from './TextField';

class App extends Component {

  componentDidMount() {
    this.loadBlockchainData();
    const eventSource = new EventSource('http://localhost:5000');
    eventSource.onmessage = (event) => {
      console.log(event);
      this.setState({ event });
    };
    eventSource.onerror = () => {
      console.log('Socket closed');
      eventSource.close();
    };
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const req = await web3.eth.requestAccounts();
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const myContract = new web3.eth.Contract(MYCONTRACT_ABI, MYCONTRACT_ADDRESS);
    this.setState({ myContract });
    this.setState({ loading: false });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      loading: true,
      event: ""
    }

    this.createTask = this.createTask.bind(this);
  }

  createTask(content) {
    this.setState({ loading: true });
    this.state.myContract.methods.createTask(content).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <h1 className="navbar-brand p-2">Decent Labs Assignment | Ethereum Smart Contract App</h1>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main className="col-lg-12 d-flex justify-content-center">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TextField
                  createTask={this.createTask} />
              }
            </main>
          </div>
          <div className="return-field">
            <div className="text-center"><h3>List of user inputs returned from database using ROT13:</h3></div>
            <div>{this.state.event.data}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
