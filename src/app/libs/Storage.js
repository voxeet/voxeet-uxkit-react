import Cookies from "js-cookie";
import { isElectron } from "./browserDetection";

let today = new Date();
today.setDate(today.getDate() + 365);

const default_cookies_param = {
  path: "/",
  expires: today,
  secure: true,
  sameSite: "none",
};
let api,
  hasDefaults = false;

if (isElectron()) {
  api = window.localStorage;
} else {
  hasDefaults = Cookies.withAttributes;
  api = hasDefaults ? Cookies.withAttributes(default_cookies_param) : Cookies;
}

const getCookie = (key) => {
  if (isElectron()) {
    return api.getItem(key);
  } else return api.get(key);
};

const setCookie = (key, value, ignore) => {
  if (isElectron()) {
    return api.setItem(key, value);
  } else if (hasDefaults) return api.set(key, value);
  else return api.set(key, value, default_cookies_param);
};

exports.get = getCookie;

exports.set = setCookie;

exports.getDevice = (key) => {
  const str = getCookie(key);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }
  return null;
};

exports.setDevice = (key, value, ignore) => {
  setCookie(key, JSON.stringify(value, ignore));
};
