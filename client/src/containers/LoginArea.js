import  { connect } from 'react-redux';
import LoginComponent from '../components/LoginArea';

const mapStateToProps = state => {
  return {username: state.loginReducer.username}
};

const mapDispatchToProps = dispatch => ({
  loginSuccess: username => {
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: username
    });
  },
  logoutSuccess: () => {
    dispatch({
      type: "LOGOUT_SUCCESS"
    });
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
