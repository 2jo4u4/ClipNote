import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'raycast-dark',
      values: [
        { name: 'raycast-dark', value: '#18181b' },
        { name: 'raycast-light', value: '#faf9f6' },
      ],
    },
  },
};

export default preview;
