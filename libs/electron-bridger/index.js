// @ts-ignore
import { contextBridge, ipcMain, ipcRenderer } from 'electron'

export const isRenderer = typeof window !== 'undefined'

export const Bridge = () => {
  const registeredInstances = {}

  const newInstancInRenderer = (name, pluginCallback) => {
    const instance = pluginCallback()
    const functionList = Object.entries(instance).filter(
      ([_, value]) => typeof value === 'function',
    )
    if (!registeredInstances[name]) {
      registeredInstances[name] = {}
    }
    for (const [functionName] of functionList) {
      if (!registeredInstances[name][functionName]) {
        registeredInstances[name][functionName] = (...args) => {
          return ipcRenderer.invoke(`${name}-${functionName}`, ...args)
        }
      }
    }
    contextBridge.exposeInMainWorld(name, {
      ...registeredInstances[name],
    })
    return registeredInstances[name]
  }

  const newInstancInMain = (name, pluginCallback) => {
    const instance = pluginCallback()
    const functionList = Object.entries(instance).filter(
      ([_, value]) => typeof value === 'function',
    )
    for (const [functionName] of functionList) {
      ipcMain.handle(`${name}-${functionName}`, async (_, ...args) => {
        return await instance[functionName](...args)
      })
    }
    return instance
  }

  const registerPlugin = (name, pluginCallback) => {
    if (isRenderer) {
      return newInstancInRenderer(name, pluginCallback)
    }
    return newInstancInMain(name, pluginCallback)
  }
  const register = (plugins) => {
    plugins.forEach(([name, pluginCallback]) => {
      registerPlugin(name, pluginCallback)
    })
  }
  return {
    registeredInstances,
    register,
  }
}

export const bridge = Bridge()

export default bridge.registeredInstances
