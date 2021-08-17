import React, { Component } from 'react'

class TextField extends Component {

  render() {
    return (
      <div id="content">
        <form onSubmit={(event) => {
          event.preventDefault();
          this.props.createTask(this.task.value);
        }}>
          <input
            id="newTask"
            ref={(input) => {
              this.task = input
            }}
            type="text"
            className="form-control"
            placeholder="Add letters to transform"
            required />
          <input type="submit" hidden={true} />
        </form>
      </div>
    );
  }
}

export default TextField;
