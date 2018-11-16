import VoxeetSdk from '@voxeet/voxeet-web-sdk'

export default class Sdk {
    constructor() { throw new Error("Don't instanciate !")}

    static create() {
        if(!Sdk.instance) {
            Sdk.instance = new VoxeetSdk()
        }

        return Sdk.instance
    }

    static setSdk(sdk) {
        Sdk.instance = sdk
    }
}