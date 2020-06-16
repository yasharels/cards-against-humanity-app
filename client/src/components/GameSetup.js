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
        options.push(<option value={i}>{i}</option>);
      }
      else {
        options.push(<option value={i} selected="selected">{i}</option>);
      }
    }
    return options;
  }
  renderIdleTimerDropdown() {
    let options = [<option value={1} selected={this.props.data.idleTimer === 1}>1m</option>];
    for (let i = 5; i <= 25; i += 5) {
      if (i !== this.props.data.idleTimer) {
        options.push(<option value={i}>{i + 'm'}</option>);
      }
      else {
        options.push(<option value={i} selected="selected">{i + 'm'}</option>);
      }
    }
    options.push(<option value="" selected={this.props.data.idleTimer === null}>Unlimited</option>);
    return options;
  }
  handleGamepointChange(e) {
    this.props.socket.send(JSON.stringify({event: 'gamePoint', payload: {id: this.props.id, gamePoint: e.target.value}}));
  }
  handleIdleTimerChange(e) {
    this.props.socket.send(JSON.stringify({event: 'idleTimer', payload: {id: this.props.id, timer: e.target.value}}));
  }
  render() {
    const data = this.props.data;
    return (
      <React.Fragment>
      <form>
        <fieldset>
          <legend>Game settings:</legend>
          <label>Gamepoint: <select onChange={this.handleGamepointChange.bind(this)} disabled={this.props.username !== data.host}>{this.renderGamePointDropdown()}</select></label>
          <label>Idle timer: <select onChange={this.handleIdleTimerChange.bind(this)} disabled={this.props.username !== data.host}>{this.renderIdleTimerDropdown()}</select></label>
          <label>Game password: <input type="text" onBlur={this.handleGamePass.bind(this)}/></label>
        </fieldset>
      </form>
      </React.Fragment>
    )
  }
}
