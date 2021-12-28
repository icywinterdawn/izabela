import styled from 'vue3-styled-components'
import store from '@/store'
import { textProps } from '@/core/components/Text/consts'

const theme = store.getters['theme']

export const StText = styled('div', textProps)`
  color: ${ theme.colors.black };
  font-family: ${ theme.fontFamily.sans.join(', ') };
  font-size: ${ ({size}) => theme.fontSize[size||'2'][0] };
  line-height: ${ ({size}) => theme.fontSize[size||'2'][1].lineHeight };
  letter-spacing: ${ ({size}) => theme.fontSize[size||'2'][1].letterSpacing };
`
