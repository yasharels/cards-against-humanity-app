import React, { Component } from 'react';

export default class GameSetup extends Component {
  state = {};

  componentDidMount() {
    const { socket, id } = this.props;
    socket.on('gameSetupData', this.props.handler);
    this.cleanup = () => {
      socket.off("gameSetupData");
    };
    socket.send(JSON.stringify({event: 'getSetupData', payload: id}));
  }
  componentWillUnmount() {
    this.cleanup();
  }
  handleGamePass(e) {
    const pass = e.target.value;
    if (pass) this.props.socket.send(JSON.stringify({event: 'setGamePass', payload: {id: this.props.id, pass}}));
  }
  renderGamePointDropdown() {
    let options = [];
    for (let i = 1; i <= 50; i++) {
      if (i !== this.props.data.gamePoint) {
        options.push(<option>{i}</option>);
      }
      else {
        options.push(<option selected="selected">{i}</option>);
      }
    }
    return options;
  }
  render() {
    const data = this.props.data;
    return (
      <React.Fragment>
      <form>
        <fieldset>
          <legend>Game settings:</legend>
          <label>Gamepoint: <select>{this.renderGamePointDropdown()}</select></label>
          <legend>Idle timer: {data.idleTimer || "Unlimited"}</legend>
          <label>Game password: <input type="text" onBlur={this.handleGamePass.bind(this)}/></label>
        </fieldset>
      </form>
      </React.Fragment>
    )
  }
}
