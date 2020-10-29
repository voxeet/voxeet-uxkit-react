export const getVideoDeviceName = ({
    currentVideoDevice
  }) => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        return navigator.mediaDevices
          .enumerateDevices()
          .then(function (sources) {
            /* GET SOURCES */
            sources.forEach(source => {
                if (source.kind === "videoinput" && source.deviceId == currentVideoDevice) {
                    if (source.facingMode == "environment" || source.label.indexOf("facing back") >= 0) {
                        return Promise.resolve(true)
                    }
                }
            })
            return Promise.resolve(false)
        })
    }
}