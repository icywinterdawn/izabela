/* eslint-disable import/no-extraneous-dependencies */
import { Story } from '@storybook/vue3'
import tokens from '@/styles/tokens'
import NvStack from './NvStack.vue'
import NvButton from '../Button/NvButton.vue'
import { props, alignValues, justifyValues } from './stack.shared'

export default {
  title: 'Stack',
  component: NvStack,
  argTypes: {
    spacing: {
      options: Object.keys(tokens.spacing).map(Number),
      control: 'inline-radio',
      defaultValue: props.spacing.default,
    },
    align: {
      options: alignValues,
      control: 'inline-radio',
      defaultValue: props.align.default,
    },
    justify: {
      options: justifyValues,
      control: 'inline-radio',
      defaultValue: props.justify.default,
    },
  },
}

const Template: Story = (args) => ({
  components: { NvStack, NvButton },
  setup() {
    return {
      args,
    }
  },
  template: `
      <NvStack v-bind="args" :style="{height: '300px'}">
        <NvButton>1</NvButton>
        <NvButton>2</NvButton>
        <NvButton>3</NvButton>
      </NvStack>`,
})

export const Default = Template.bind({})
Default.args = {}
