import type { Preview } from '@storybook/react'
import '../src/tokens/index'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'ios-light',
      values: [
        {
          name: 'ios-light',
          value: '#F2F2F7', // iOS systemGroupedBackground light
        },
        {
          name: 'ios-dark',
          value: '#000000', // iOS systemGroupedBackground dark
        },
        {
          name: 'white',
          value: '#FFFFFF',
        },
        {
          name: 'black',
          value: '#000000',
        },
      ],
    },
    viewport: {
      viewports: {
        iphone14: {
          name: 'iPhone 14',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
        iphone14Pro: {
          name: 'iPhone 14 Pro',
          styles: {
            width: '393px',
            height: '852px',
          },
        },
        iphone14ProMax: {
          name: 'iPhone 14 Pro Max',
          styles: {
            width: '428px',
            height: '926px',
          },
        },
        iphone14Plus: {
          name: 'iPhone 14 Plus',
          styles: {
            width: '428px',
            height: '926px',
          },
        },
      },
      defaultViewport: 'iphone14Pro',
    },
  },
  globalTypes: {
    colorScheme: {
      name: 'Color Scheme',
      description: 'iOS color scheme (Light/Dark mode)',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light Mode', icon: 'sun' },
          { value: 'dark', title: 'Dark Mode', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
}

export default preview
