import React, { Component } from "react";
import PropTypes from "prop-types";
import browser from "bowser";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import PhoneOff from "../../../../static/images/icons/btn-dialin-off.svg";
import PhoneOn from "../../../../static/images/icons/btn-dialin-on.svg";
import { pinCode } from "../../../constants/PinCode";
import { isMobile } from "../../../libs/browserDetection";

class TogglePSTN extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      isMobile: isMobile(),
      hover: false
    };
    this.togglePopUp = this.togglePopUp.bind(this);
    this.toggleClosePopUp = this.toggleClosePopUp.bind(this);
    this.togglePinCode = this.togglePinCode.bind(this);
  }

  togglePinCode(type) {
    this.props.toggle(type);
    this.setState({ opened: !this.state.opened });
  }

  togglePopUp() {
    this.setState({ opened: !this.state.opened });
  }

  toggleClosePopUp() {
    this.setState({ opened: !this.state.opened, hover: false });
  }

  country2emoji(country_code) {
    var OFFSET = 127397;
    var cc = country_code.toUpperCase();
    function _toConsumableArray(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
          arr2[i] = arr[i];
        }
        return arr2;
      } else {
        return Array.from(arr);
      }
    }
    return /^[A-Z]{2}$/.test(cc)
      ? String.fromCodePoint.apply(
          String,
          _toConsumableArray(
            [].concat(_toConsumableArray(cc)).map(function(c) {
              return c.charCodeAt() + OFFSET;
            })
          )
        )
      : null;
  }

  render() {
    const { toggle, tooltipPlace, isBottomBar, conferencePincode } = this.props;
    const { hover, isMobile, opened } = this.state;
    return (
      <li
        id="pincode-container"
        className={opened ? "active" : ""}
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-pincode"
          className={"" + (opened ? "on" : "off")}
          title={strings.pincode}
          onClick={() => this.togglePopUp()}
        >
          <img src={hover || opened ? PhoneOn : PhoneOff} />
          {isBottomBar && (
            <div>
              <span>{strings.pincode}</span>
            </div>
          )}
        </a>
        {opened && (
          <div className="bubble-tip">
            <a
              className="icon-close"
              title="Close"
              currentitem="false"
              onClick={() => this.toggleClosePopUp()}
            ></a>
            <span className="title">{strings.pincode}</span>

            <div>
              <p>
                <span className="pincode">{conferencePincode}</span>
              </p>
              <p>{strings.pinCodeExplanations}</p>
              { pinCode.length > 0 ?
                <select>
                  {pinCode.map((code, i) => {
                    return (
                      <option key={i}>
                        {this.country2emoji(code.Code)} {code.Number}
                      </option>
                    );
                  })}
                </select>
              :
                  <div className="no-pstn-numbers">{strings.noPstnNumbers}</div>
              }
            </div>

            <div className="anchor-popup"></div>
          </div>
        )}
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-pincode"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.pincode}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

TogglePSTN.propTypes = {
  conferencePincode: PropTypes.string,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

TogglePSTN.defaultProps = {
  tooltipPlace: "right"
};

export default TogglePSTN;
