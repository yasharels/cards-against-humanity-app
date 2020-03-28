export default function loginReducer (state = {}, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      return {...state, username: action.payload};
    }
    case 'LOGOUT_SUCCESS': {
      return {...state, username: null};
    }
    default: {
      return state;
    }
  }
}
