import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import LayoutSpeaker from '../../../../static/images/newicons/icon-layout-speaker.svg';
import LayoutTiles from '../../../../static/images/newicons/icon-layout-tile.svg';
import Layout3D from '../../../../static/images/newicons/icon-layout-3d.svg';

let strings = new LocalizedStrings({
 en:{
   list: "List",
   displaymode: "Display mode",
   tile: "Tile",
   speaker: "Speaker",
   changelayout: "Change layout"
 },
 fr: {
   list: "Liste",
   displaymode: "Mode d'affichage",
   tile: "Tuile",
   speaker: "Locuteur",
   changelayout: "Changer mode d'affichage"
 }
});

class ToggleModeButton extends Component {

    constructor(props) {
        super(props)
    }

    getModeIcon(mode) {
        switch (mode) {
          case 'tiles':
            return LayoutTiles;
          case 'list':
            return Layout3D;
          case 'speaker':
            return LayoutSpeaker;
        }
    }

    getModeTranslation(mode) {
        switch (mode) {
          case 'tiles':
            return strings.tile;
          case 'list':
            return strings.list;
          case 'speaker':
            return strings.speaker;
        }
    }

    render() {
        const { mode, toggleMode, tooltipPlace } = this.props
        return (
            <div onClick={() => toggleMode()} className="layout-container">
                <p>{strings.changelayout}</p>
                <a data-tip data-for="toggle-mode"
                    className={'icn-switch-list '}
                    title={strings.displaymode}>
                    <img src={this.getModeIcon(mode)} />
                </a>
            </div>
        )
    }
}

ToggleModeButton.propTypes = {
    mode: PropTypes.string.isRequired,
    toggleMode: PropTypes.func.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
};

ToggleModeButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleModeButton
