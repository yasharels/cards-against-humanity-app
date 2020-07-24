export default function gameRoomReducer (state = {}, action) {
  switch (action.type) {
    case 'JOIN_GAME_ROOM': {
      let obj = {};
      obj[action.payload] = {};
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
    case 'RECEIVED_GAME_DATA': {
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
    case 'GAME_END': {
      let {id, data} = action.payload;
      let obj = {};
      obj[id] = {
        ...state[id],
        gameOptions: data
      }
      return {...state, ...obj};
    }
    default: {
      return state;
    }
  }
}
