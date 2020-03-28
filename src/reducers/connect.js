export default function connectReducer (state = {isLoading: true}, action) {
  if (action.type === "SOCKET_CONNECTED") {
    return {isLoading: false};
  }
  return state;
};
