import React,{Component} from "react"

import {ConferenceRoom} from "../../VoxeetReactComponents";

const constraints = {
    audio: true,
    video: true
};

const videoRatio = {
    width: 1280,
    height: 720
};

const settings = {
    consumerKey: "CONSUMER_KEY",
    consumerSecret: "CONSUMER_SECRET",
    conferenceAlias: "conference_name"
};

export default class Main extends Component{

    state={token:null}

    constructor(props) {
        super(props);
        this.getToken = this.getToken.bind(this);

    }

    getToken(){
        const url = "https://staging-session.voxeet.com/test/token/dvcs";

        const headers = new Headers();

        const params = {
            method: 'GET',
            headers,
            mode: 'cors',
            cache: 'default'
        };

        fetch(url, params).then(response => response.json().then(json => ({ json, response })))
            .then(({ json, response }) => {
                if (!response.ok) {
                    return Promise.reject(json);
                } else if (response.status >= 200 && response.status <= 299) {
                    return json;
                }
                return Promise.reject(json);
            }).then(
            ({access_token}) => {
                this.setState(state=>{return{...state, token:access_token}})
            },
            error => ({
                error: error.message || "Something bad happened"
            })
        );
    }

    componentDidMount() {
        this.getToken();
    }

    render() {

        const {token} = this.state;

        return !!token ?
            <ConferenceRoom
                isWidget={false}
                autoJoin
                videoRatio={videoRatio}
                kickOnHangUp
                handleOnLeave={()=>console.log("participant deconnected")}
                handleOnConnect={()=>console.log("participant connecting")}
                constraints={constraints}
                conferenceAlias={settings.conferenceAlias}
                videoCodec={"H264"}
                oauthToken={token}
                refreshTokenCallback={this.getToken}
            />:
            <div>{"not connceted"}</div>
    }
}