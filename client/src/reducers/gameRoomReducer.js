export default function gameRoomReducer (state = {}, action) {
  switch (action.type) {
    case 'JOIN_GAME_ROOM': {
      let obj = {};
      obj[action.payload] = {
        chatLog: []
      };
      return {...state, ...obj};
    }
    case 'LEAVE_GAME_ROOM': {
      let {[action.payload]: omit, ...res} = state;
      return res;
    }
    case 'RECEIVED_GAMEROOM_DATA': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        ...data
      };
      return {...state, ...obj};
    }
    case 'RECEIVED_GAMEOPTIONS_DATA': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        gameOptions: {...state[id].gameOptions, ...data}
      };
      return {...state, ...obj};
    }
    case 'GAME_DATA_CHANGE': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        gameData: {...state[id].gameData, ...data}
      };
      return {...state, ...obj};
    }
    case 'GAME_START': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        gameData: data
      };
      return {...state, ...obj};
    }
    case 'ROUND_END': {
      let {id, data} = action.payload;
      let obj = {};
      let gameEnded = !data.nextRoundData;
      if (gameEnded) {
        let scoreBoard = {};
        Object.keys(state[id].scoreBoard).forEach(player => {
          scoreBoard[player] = 0;
        });
        obj[id] = {
          ...state[id],
          gameData: null,
          scoreBoard
        };
      }
      else {
        obj[id] = {
          ...state[id],
          gameData: {...state[id].gameData, chosenCard: null, whiteCardsPlayed: {}, ...data.nextRoundData}
        };
      }
      return {...state, ...obj};
    }
    case 'WHITE_CARD_CHOSEN': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        gameData: {...state[id].gameData, chosenCard: data.card},
        scoreBoard: {...state[id].scoreBoard, [data.roundWinner]: state[id].scoreBoard[data.roundWinner] + 1}
      };
      return {...state, ...obj};
    }
    case 'CHAT_MESSAGE': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        chatLog: [...state[id].chatLog, {name: data.name, content: data.content}]
      };
      return {...state, ...obj};
    }
    default: {
      return state;
    }
  }
}
