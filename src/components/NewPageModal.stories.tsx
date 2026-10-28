import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { NewPageModal, NewPageData } from './NewPageModal';

const meta: Meta<typeof NewPageModal> = {
  title: 'Raycast/NewPageModal',
  component: NewPageModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NewPageModal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [lastCreated, setLastCreated] = useState<NewPageData | null>(null);

    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-raycast-amber text-raycast-dark-bg font-medium text-sm hover:brightness-110 transition-all"
        >
          開啟「新增筆記頁」彈窗
        </button>

        {lastCreated && (
          <div className="p-4 rounded-xl bg-raycast-dark-surface border border-raycast-dark-border text-xs text-raycast-dark-text font-mono">
            <div>最後建立的筆記頁：</div>
            <pre className="mt-2 text-raycast-amber">
              {JSON.stringify(lastCreated, null, 2)}
            </pre>
          </div>
        )}

        <NewPageModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={(data) => {
            setLastCreated(data);
          }}
        />
      </div>
    );
  },
};
