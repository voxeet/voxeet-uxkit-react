export const isIOS = () => {
    return (/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
}

export const isMobile = () => {
    return isIOS() ||
    /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
}