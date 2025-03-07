import { api } from '@/services'
import { registerEngine } from '@/modules/speech-engine-manager'
import { useSpeechStore } from '@/features/speech/store'
import NvVoiceSelect from './NvVoiceSelect.vue'
import NvSettings from './NvSettings.vue'
import { ENGINE_ID, ENGINE_NAME, getVoiceName } from './shared'
import { getProperty, setProperty } from './store'

const getCredentials = () => ({
  apiKey: getProperty('apiKey', true),
  url: getProperty('url'),
})

const getSelectedVoice = () => getProperty('selectedVoice')
registerEngine({
  id: ENGINE_ID,
  name: ENGINE_NAME,
  category: 'cloud',
  getSelectedVoice,
  getVoiceName,
  getCredentials,
  hasCredentials() {
    const speechStore = useSpeechStore()
    return (
      speechStore.hasUniversalApiCredentials ||
      Object.values(getCredentials()).every(Boolean)
    )
  },
  getPayload({ text, translatedText, voice }) {
    return {
      text: translatedText || text,
      voice: (voice || getSelectedVoice()).name,
      ratePercentage: Number(getProperty('ratePercentage')),
      pitchPercentage: Number(getProperty('pitchPercentage')),
    }
  },
  getLanguageCode(voice) {
    return (voice || getSelectedVoice()).language
  },
  synthesizeSpeech({ credentials, payload }) {
    return api(
      getProperty('useLocalCredentials') ? 'local' : 'remote',
    ).post<Blob>(
      '/tts/ibm-watson/synthesize-speech',
      {
        credentials,
        payload,
      },
      { responseType: 'blob' },
    )
  },
  voiceSelectComponent: NvVoiceSelect,
  settingsComponent: NvSettings,
  store: { setProperty, getProperty },
})
