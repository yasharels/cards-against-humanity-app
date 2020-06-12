import React, { Component } from 'react';

export default class GameSetup extends Component {
  state = {};

  dataHandler(data) {
    this.setState(data);
  }
  componentDidMount() {
    const { socket, id } = this.props;
    this.dataHandler = this.dataHandler.bind(this);
    socket.on("gameSetupData", this.dataHandler);
    this.cleanup = () => {
      socket.off("gameSetupData");
    };
    socket.send(JSON.stringify({event: 'getSetupData', payload: id}));
  }
  componentWillUnmount() {
    this.cleanup();
  }
  renderGamePointDropdown() {
    let options = [];
    for (let i = 1; i <= 50; i++) {
      if (i !== this.state.gamePoint) {
        options.push(<option>{i}</option>)
      }
      else {
        options.push(<option selected="selected">{i}</option>)
      }
    }
    return options;
  }
  render() {
    const state = this.state;
    return (
      <React.Fragment>
      <form>
        <fieldset>
          <legend>Game settings:</legend>
          <label>Game point: <select>{this.renderGamePointDropdown()}</select></label>
          <legend>Idle timer: {state.idleTimer ? state.idleTimer : "Unlimited"}</legend>
          <label>Game password: <input type="text" /></label>
        </fieldset>
      </form>
      </React.Fragment>
    )
  }
}
