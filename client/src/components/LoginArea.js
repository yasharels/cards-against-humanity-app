import React, { Component } from 'react';

class LoginArea extends Component {
  state = {
    lastInput: null,
    loginErrorMessage: false
  }

  login(username) {
    this.props.socket.send(JSON.stringify({event: 'login', payload: username}));
  }
  logout() {
    this.setState({lastInput: null});
    this.props.socket.send(JSON.stringify({event: 'logout'}));
  }
  handleInputChange(e) {
    this.setState({lastInput: e.target.value});
  }
  onLoginSuccess(data) {
    let name = localStorage.getItem("username");
    if (!name) localStorage.setItem("username", data);
    this.props.loginSuccess(data);
  }
  onLoginFailure(data) {
    this.setState({loginErrorMessage: data});
  }
  onLogoutSuccess() {
    localStorage.removeItem("username");
    this.setState({loginErrorMessage: false});
    this.props.logoutSuccess();
  }
  componentDidMount() {
    this.props.socket.on('loginSuccess', this.onLoginSuccess.bind(this));
    this.props.socket.on('loginFailure', this.onLoginFailure.bind(this));
    this.props.socket.on('logoutSuccess', this.onLogoutSuccess.bind(this));
  }
  render() {
    let username = this.props.username;
    if (!username) {
      let buttonDisabled = !this.state.lastInput;
      return (
        <React.Fragment>
          <input type="text" id="usernameInput" onChange={this.handleInputChange.bind(this)}/>
          <button id="loginButton"
          onClick={() => this.login.bind(this)(document.getElementById('usernameInput').value)}
          disabled={buttonDisabled}>
          Login</button>
          {this.state.loginErrorMessage && <span id="loginErrorMsg">{this.state.loginErrorMessage}</span>}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
      <span id="loggedIn">{username}</span>
      <button id="logoutButton" onClick={() => this.logout()}>Logout</button>
      </React.Fragment>
    );
  }
}

export default LoginArea;
