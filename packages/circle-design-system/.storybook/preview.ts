import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'beige',
          value: '#FBF9F7',
        },
        {
          name: 'navy',
          value: '#0F0F35',
        },
      ],
    },
  },
};

export default preview;
