import React, { useContext } from "react";
import { connect } from "react-redux";
import { Provider } from "react-redux";
import { getUxKitContext } from "./../context";

const VoxeetProvider = (props) => {
  return (
    <Provider store={props.store} context={getUxKitContext()}>
      {props.children}
    </Provider>
  );
};

export default VoxeetProvider;
