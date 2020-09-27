import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default class GameInfoBox extends Component {

  render() {
    let data = this.props.gameData;

    return (
      <React.Fragment>
        <div className="gameinfobox">
          <div className="gameinfobox-left">
            <div className="gameinfoTitle">
              <h3 className="gameinfoTitleText">{`${data.host}'s Game`}</h3>
            </div>
            <div key="gamepoint">
              <strong>Gamepoint: </strong>
              <span>{data.gamePoint}</span>
            </div>
            <div key="players">
              <strong>Players: </strong>
              <span>{data.players.join(", ")}</span>
            </div>
          </div>
          <div className="gameinfobox-right">
            <Link className="gamelink" to={`/game/${data.id}`}><button>Join this game.</button></Link>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
