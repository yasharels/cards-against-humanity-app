import React, { Component } from 'react';

export default class GameSetup extends Component {
  state = {
    showGameStartWarning: false
  };

  componentDidMount() {
    const { socket, id } = this.props;
    socket.on('gameOptions', this.props.handler);
    this.cleanup = () => {
      socket.off("gameOptions");
    };
    socket.send(JSON.stringify({event: 'getGameOptions', payload: id}));
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
  startGame = e => {
    e.preventDefault();
    let data = this.props.data;
    let {players} = this.props;
    if (players.length < 3) this.setState({showGameStartWarning: true});
    else {
      if (this.state.showGameStartWarning) this.setState({showGameStartWarning: false});
      this.props.socket.send(JSON.stringify({
        event: 'startGame',
        payload: {
          id: this.props.id,
          gameSettings: {
            idleTimer: data.idleTimer,
            gamePoint: data.gamePoint
          }
        }
      }
      ));
    }
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
          <label><button disabled={this.props.username !== data.host} onClick={this.startGame}>Start game</button></label>
        </fieldset>
      </form>
      {this.state.showGameStartWarning && <span>You must have at least 3 players to start a game.</span>}
      </React.Fragment>
    )
  }
}
