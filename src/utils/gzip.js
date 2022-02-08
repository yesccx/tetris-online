import pako from 'pako'

const transformArrayBufferToBase64 = (buffer) => {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    for (let len = bytes.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// b64Data-->传入加密的数据进行解密
export const unzip = (rawData) => {
    try {
        let strData = window.atob(rawData)
        // Convert binary string to character-number array
        let charData = strData.split('').map(function (x) { return x.charCodeAt(0) })
        // Turn number array into byte-array
        let binData = new Uint8Array(charData)
        // // unzip
        let data = pako.inflate(binData)
        // Convert gunzipped byteArray back to ascii string:
        strData = String.fromCharCode.apply(null, new Uint16Array(data))
        return JSON.parse(strData)
    } catch (e) {
        return rawData
    }
}

// 压缩
export const zip = (strData) => {
    return transformArrayBufferToBase64(pako.deflate(JSON.stringify(strData)))
}