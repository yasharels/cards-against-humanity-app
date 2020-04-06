import React, { Component, Fragment } from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';

class App extends Component {
  render() {
    return (
    <Router>
        <Route
          exact path="/"
          render={ props => {
            if (this.props.isLoading) return "im loading";
            return  <Lobby {...props} socket={this.props.socket}/>
          }}
        />
        <Route
          path="/game/:id"
          render={props => {
            if (this.props.isLoading) return "im loading";
            return <GameRoom {...props} socket={this.props.socket}/>
          }}
        />
    </Router>
  )
}
}

export default App;
