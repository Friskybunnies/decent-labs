import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { MYCONTRACT_ABI, MYCONTRACT_ADDRESS } from './config';
import TodoList from './TodoList';

class App extends Component {
  
  /* updateMessage(message) {
    const list = document.getElementById('messages')
    const item = document.createElement('p')
    item.textContent = message
    list.appendChild(item)
  } */

  componentDidMount() {
    this.loadBlockchainData();
    const eventSource = new EventSource('http://localhost:5000');
    eventSource.onmessage = (event) => {
      console.log(event);
    };
    eventSource.onerror = () => {
      console.log('Socket closed');
      eventSource.close();
    };
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const req = await web3.eth.requestAccounts();
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const myContract = new web3.eth.Contract(MYCONTRACT_ABI, MYCONTRACT_ADDRESS)
    this.setState({ myContract })
    const taskCount = await myContract.methods.taskCount().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await myContract.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    }

    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  createTask(content) {
    this.setState({ loading: true })
    this.state.myContract.methods.createTask(content).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.myContract.methods.toggleCompleted(taskId).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="" target="_blank">Decent Labs Assignment | Ethereum Smart Contract App</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TodoList
                  tasks={this.state.tasks}
                  createTask={this.createTask}
                  toggleCompleted={this.toggleCompleted} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
