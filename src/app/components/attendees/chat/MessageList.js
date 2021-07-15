import React, { Component } from "react";
import { VariableSizeList as List, shouldComponentUpdate as shouldRWUpdate } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

class ListRow extends Component {

    constructor(props) {
        super(props);
        this.rowRef = React.createRef();
    }

    componentDidMount() {
        if (this.rowRef && this.rowRef.current && this.props.setRowHeight) {
            this.props.setRowHeight(this.props.index, this.rowRef.current.clientHeight);
        }
    }

    render() {
        const {chatOptions} = this.props ;

        let time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(this.props.time);

        return (
            <div key={this.props.index} style={this.props.style}>
                <li ref={this.rowRef}>
                    <div className='chat-time'>{time}</div>
                    {this.props.myself ?
                        <div className="chat-container-myself">
                            <div>
                                <span className="chat-name-myself">{this.props.name}</span>
                                    {!chatOptions.autoLinker?
                                        <div className="chat-content-myself">{this.props.content}</div>:
                                        <div
                                            dangerouslySetInnerHTML={{__html: this.props.content}}
                                            className="chat-content-myself"
                                        />}
                            </div>
                            <div>
                                <img src={this.props.avatarUrl} />
                            </div>
                        </div>
                        :
                        <div className="chat-container">
                            <div>
                                <img src={this.props.avatarUrl} />
                            </div>
                            <div>
                                <span className="chat-name">{this.props.name}</span>
                                    {!chatOptions.autoLinker?
                                        <div className="chat-content">{this.props.content}</div>:
                                        <div
                                            dangerouslySetInnerHTML={{__html: this.props.content}}
                                            className="chat-content"
                                        />}
                            </div>
                        </div>
                    }
                </li>
            </div>
        );
    }
}

class MessageList extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.listRef = React.createRef();
        this.getRowHeight = this.getRowHeight.bind(this);
        this.setRowHeight = this.setRowHeight.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.shouldComponentUpdate = shouldRWUpdate.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.messages.length !== this.props.messages.length || prevProps.attendeesChatOpened !== this.props.attendeesChatOpened && this.props.attendeesChatOpened && this.props.messages.length) {
            this.scrollToBottom();
        }
    }

    getRowHeight(index) {
        // console.log('getRowHeight-' + index, this.state[index] + 8)
        return this.state[index] + 8;
    }

    setRowHeight(index, size) {
        // console.log('setRowHeight-' + index, size)
        if (this.listRef && this.listRef.current) {
            this.listRef.current.resetAfterIndex(0);
        }
        this.setState({ [index]: size });
    }

    scrollToBottom() {
        const { messages } = this.props;
        if (this.listRef && this.listRef.current && messages && messages.length) {
            this.listRef.current.scrollToItem(messages.length - 1, 'end');
        }
    }

    render() {
        const { messages, currentUser, chatOptions } = this.props;

        const getItemSize = index => {
            // console.log('index', index, this.state[index]);
            return this.state[index] || 82;
        };

        let Row = ({ index, style, data }) => {
            return <ListRow
                index={index}
                style={style}
                name={data[index].name}
                avatarUrl={data[index].avatarUrl}
                content={data[index].content}
                time={data[index].time}
                myself={data[index].ownerId === currentUser.participant_id}
                setRowHeight={this.setRowHeight.bind(this)}
                chatOptions={chatOptions}
            />
        }

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        height={height}
                        itemCount={messages.length}
                        itemSize={getItemSize}
                        itemData={messages}
                        className="message-list"
                        width={width}
                        ref={this.listRef}
                    >
                        {Row}
                    </List>
                )}
            </AutoSizer>
        )
    }
}

export default MessageList;