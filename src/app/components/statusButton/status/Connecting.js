import React, { Component } from "react";

class Connecting extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="vxt-conference-status">
        <div className="icn-status status-spinner spinner-circle">
          {[...Array(12)].map((x, i) => {
            return (
              <div className={"spinner-child spinner-circle" + i} key={i}></div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Connecting;
