import React, {Component} from "react";

import _ from "utils/utils";
import App from "../app";

import {vanillaToast} from "vanilla-toast";
import "vanilla-toast/vanilla-toast.css";

export default class Chat extends Component{
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }
  componentDidMount() {
    App.on("hear", this.hear.bind(this));
    App.on("chat", messages => this.setState({ messages }));
  }
  componentWillUnmount() {
    App.off("hear", this.hear.bind(this));
    App.off("chat", messages => this.setState({ messages }));
  }
  render() {
    // must be mounted to receive messages
    return (
      <div className={`chat-container ${App.state.chat ? "" : "chat-container-hidden"}`}>
        <div className='chat' onClick={this.onClickChat}>
          <div className='messages' ref={(ref) => this.messageElement = ref}>
            {this.state.messages.map(this.Message)}
          </div>
          {this.Entry()}
        </div>
      </div>
    );
  }

  onClickChat() {
    document.getElementById("chat-input").focus();
  }

  hear(msg) {
    //Notify when hidden chat is closed
    if(!App.state.chat) {
      vanillaToast.info(`${msg.name}: ${msg.text}`);
    }
    this.state.messages.push(msg);
    this.forceUpdate(this.scrollChat);
  }
  scrollChat() {
    let el = this.messageElement;
    el.scrollTop = el.scrollHeight;
  }
  Message(msg) {
    if (!msg)
      return;

    let {time, name, text} = msg;
    let date = new Date(time);
    let hours   = _.pad(2, "0", date.getHours());
    let minutes = _.pad(2, "0", date.getMinutes());
    time = `${hours}:${minutes}`;

    return (
      <div key={_.uid()}>
        <time>{time}</time>
        {" "}
        <span className='name'>{name}</span>
        {" "}
        {text}
      </div>
    );
  }
  Entry() {
    return <input id='chat-input' autoFocus className='chat-input' type='text' onKeyDown={this.key.bind(this)} placeholder='/nick name' />;
  }
  key(e) {
    if (e.key !== "Enter")
      return;

    let el = e.target;
    let text = el.value.trim();
    el.value = "";

    if (!text)
      return;

    if (text[0] === "/")
      this.command(text.slice(1));
    else
      App.send("say", text);
  }
  command(raw) {
    let [, command, arg] = raw.match(/(\w*)\s*(.*)/);
    arg = arg.trim();
    let text, name;

    switch(command) {
    case "name":
    case "nick":
      name = arg.slice(0, 15);

      if (!name) {
        text = "enter a name";
        break;
      }

      text = `hello, ${name}`;
      App.save("name", name);
      App.send("name", name);
      break;
    default:
      text = `unsupported command: ${command}`;
    }
    this.state.messages.push({ text,
      time: Date.now(),
      name: ""
    });
    this.forceUpdate(this.scrollChat);
  }
}
