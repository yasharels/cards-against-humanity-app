import React, { Component } from 'React';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.chatlog = React.createRef();
  }

  state = {
    autoScroll: true
  };

  handleScroll(e) {
      if (e.currentTarget.scrollTop === e.currentTarget.scrollHeight - e.currentTarget.offsetHeight) this.setState({autoScroll: true});
      else this.setState({autoScroll: false});
  }
  sendMessage(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.socket.send(JSON.stringify({event: 'chatMessage', payload: {id: this.props.id, message: e.target.value}}));
      e.target.value = '';
    }
  }

  componentDidUpdate() {
    if (this.state.autoScroll) this.chatlog.current.scrollTop = this.chatlog.current.scrollHeight - this.chatlog.current.offsetHeight;
  }

  render() {
    return (
      <React.Fragment>
        <div className="chat">
          <div className="chatlog" ref={this.chatlog} onScroll={this.handleScroll.bind(this)}>
            {this.props.chatLog && this.props.chatLog.map(message => (
              <div className="chatMessage">
                <span className="chatMessageUsername">{`${message.name}: `}</span>
                <span className="chatMessageContent">{message.content}</span>
              </div>
            ))}
          </div>
          <div className="chatlog-add">
            <form className="chatbox">
              <label>{`${this.props.name}: `}</label>
              <textarea onKeyDown={this.sendMessage.bind(this)}></textarea>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
