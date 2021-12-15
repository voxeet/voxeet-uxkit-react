import React from "react";
let context = null;

// export default React.createContext();
export function getUxKitContext() {
    if(!context)
        context = React.createContext();
    return context;
}

export function setUxKitContext(newContext) {
    if(context) {
        console.warn('About to replace existing context');
    }
    context = newContext;
    return context;
}