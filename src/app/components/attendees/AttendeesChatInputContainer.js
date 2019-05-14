import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { strings } from '../../languages/localizedStrings';

class AttendeesChatInputContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            content: ""
        }
        this.onContentChange = this.onContentChange.bind(this)
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false)
    }
    
    
    componentWillUnmount(){
        document.removeEventListener("keydown", this.escFunction, false);
    }

    escFunction(event){
        const { sendMessage } = this.props
        if (event.keyCode === 13) {
            sendMessage(this.state.content)
            this.setState({ content: "" })
            event.preventDefault()
        }
        
    }

    onContentChange(e) {
        let content = e.target.value;
        this.setState({ content: content });
    }

    render() {
        const { sendMessage } = this.props
        const { content } = this.state
        return (
            <div className="container-input-chat"> 
                <input placeholder={strings.placeholderChat} onChange={this.onContentChange} value={content} id="contentInputChat" className="input-message"></input>
                <a onClick={(e) => { this.setState({content: ""});sendMessage(this.state.content);e.preventDefault() } }>{strings.sendMessage}</a>
            </div>
        )
    }
}

AttendeesChatInputContainer.propTypes = {
    sendMessage: PropTypes.func.isRequired
}

export default AttendeesChatInputContainer
