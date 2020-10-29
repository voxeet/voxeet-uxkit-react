import reaching_out from "../../static/sounds/voxeet_reaching_out.mp3";
import conference_exit from "../../static/sounds/voxeet_conference_exit.mp3";
import mute_off from "../../static/sounds/voxeet_Exit_Mute.mp3";
import mute_on from "../../static/sounds/voxeet_Enter_Mute.mp3";
import call_recorded from "../../static/sounds/call-recorded.mp3";
import conference_join from "../../static/sounds/voxeet_conference_join.mp3";

const isDevelopment = process.env.NODE_ENV === 'development';

const defaults = {
    conference_join,
    conference_exit,
    mute_off,
    mute_on,
    call_recorded,
    reaching_out,
}

const custom = {

}

const sounds = {
    get reaching_out() {
        return custom.reaching_out || defaults.reaching_out;
    },
    set reaching_out(value) {
        return custom.reaching_out = value;
    },
    get conference_exit() {
        return custom.conference_exit || defaults.conference_exit;
    },
    set conference_exit(value) {
        return custom.conference_exit = value;
    },
    get mute_off() {
        return custom.mute_off || defaults.mute_off;
    },
    set mute_off(value) {
        return custom.mute_off = value;
    },
    get mute_on() {
        return custom.mute_on || defaults.mute_on;
    },
    set mute_on(value) {
        return custom.mute_on = value;
    },
    get call_recorded() {
        return custom.call_recorded || defaults.call_recorded;
    },
    set call_recorded(value) {
        return custom.call_recorded = value;
    },
    get conference_join() {
        if(isDevelopment)
            console.log('About to get conference_join as', custom.conference_join, defaults.conference_join)
        return custom.conference_join || defaults.conference_join;
    },
    set conference_join(value) {
        if(isDevelopment)
            console.log('About to set conference_join to', value)
        return custom.conference_join = value;
    },
};

// function importAll (r) {
//     r.keys().forEach(key => cache[key] = r(key));
//     setTimeout(()=> {
//         console.dir('sounds', cache)
//     }, 500)
// }
//
// importAll(require.context('../../static/sounds', true, /\.mp3$/));
// // At build-time cache will be populated with all required modules.mp3

export default sounds;