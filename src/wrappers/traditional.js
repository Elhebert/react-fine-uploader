import objectAssign from 'object-assign'
import qq from 'fine-uploader'

import CallbackProxy from './callback-proxy'
import { traditional as callbackNames } from './callback-names'

const callbackProxies = new WeakMap()

export default class FineUploaderTraditional {
    constructor({ options }) {
        const callbacks = options.callbacks
        const optionsSansCallbacks = Object.assign({}, options)

        delete optionsSansCallbacks.callbacks

        callbackProxies.set(this, createCallbackProxies(callbackNames))
        
        registerOptionsCallbacks({ callbacks, callbackProxies: callbackProxies.get(this) })

        this.methods = createFineUploader({
            callbackProxies: callbackProxies.get(this),
            options: optionsSansCallbacks 
        })
    }

    off(name, callback) {
        const proxy = callbackProxies.get(this)[name]
        proxy.remove(callback)
    }

    on(name, callback) {
        const proxy = callbackProxies.get(this)[name]
        proxy.add(callback)
    }
}

const createCallbackProxies = names => {
    const proxyMap = {}
    
    names.forEach(callbackName => {
        proxyMap[callbackName] = new CallbackProxy(callbackName)
    })
    
    return proxyMap
}

const createFineUploader = ({ callbackProxies, options} ) => {
    const optionsCopy = objectAssign({}, options)

    optionsCopy.callbacks = Object.keys(callbackProxies).map(callbackName => {
        const proxy = callbackProxies[callbackName]
        
        return {
            [callbackName]: proxy.proxyFunction
        }
    })

    return new qq.FineUploaderBasic(optionsCopy)
}

const registerOptionsCallbacks = ({ callbacks, callbackProxies }) => {
    Object.keys(callbackProxies).forEach(callbackProxyName => {
        const callbackProxy = callbackProxies[callbackProxyName]

        callbackProxy.add(callbacks[callbackProxyName])
    })
}