import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default class LinkCard extends Component {
  id =  this.props.game.id;
  gamePoint = this.props.game.gamePoint;
  users = this.props.game.users;
  creator = this.props.game.creator;

  render() {
    return (
      <React.Fragment>
        <ul>
          <li key={1}>Gamepoint: {this.gamePoint}</li>
          <li key={2}>Users: {this.users}</li>
        </ul>
        <Link to={`/game/${this.id}`}><button>Join this game.</button></Link>
      </React.Fragment>
    );
  }
}
