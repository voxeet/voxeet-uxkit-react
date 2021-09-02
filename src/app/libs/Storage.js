import Cookies from "js-cookie";
import {isElectron} from "./browserDetection";

let today = new Date();
today.setDate(today.getDate() + 365);

const default_cookies_param = {
    path: "/",
    expires: today,
    secure: true,
    sameSite: 'none'
};
let api, hasDefaults=false;

if(isElectron()) {
    api = window.localStorage;
} else {
    hasDefaults =  Cookies.withAttributes;
    api = hasDefaults?Cookies.withAttributes(default_cookies_param):Cookies;
}

exports.get = (key) => {
    if(isElectron()){
        return api.getItem(key);
    }
    else
        return api.get(key);
}

exports.set = (key, value, ignore) => {
    if(isElectron()){
        return api.setItem(key, value);
    }
    else if (hasDefaults)
        return api.set(key, value);
    else
        return api.set(key, value, default_cookies_param);
}