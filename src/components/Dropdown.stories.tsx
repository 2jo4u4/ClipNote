import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown, DropdownOption } from './Dropdown';
import { Globe, Layers, Hash, BookOpen } from 'lucide-react';

const sampleOptions: DropdownOption[] = [
  { id: 'SYSTEM_GLOBAL_PAGE', label: '全域筆記頁', icon: <Globe className="w-3.5 h-3.5 text-raycast-coral" /> },
  { id: 'p1', label: '104 中文經歷', icon: <Hash className="w-3.5 h-3.5 text-raycast-amber" /> },
  { id: 'p2', label: '社交平台貼文', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'p3', label: 'CakeResume 英文檔案', icon: <Layers className="w-3.5 h-3.5 text-sky-400" /> },
];

const meta: Meta<typeof Dropdown> = {
  title: 'Raycast/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState('SYSTEM_GLOBAL_PAGE');

    return (
      <div className="p-8 bg-raycast-dark-bg min-h-[250px] flex items-start justify-center">
        <Dropdown
          value={selected}
          options={sampleOptions}
          onChange={setSelected}
          icon={<Globe className="w-3.5 h-3.5 text-raycast-coral" />}
        />
      </div>
    );
  },
};

export const LightAndDark: Story = {
  render: () => {
    const [darkVal, setDarkVal] = useState('p1');
    const [lightVal, setLightVal] = useState('p2');

    return (
      <div className="flex gap-6 p-8 min-h-[300px]">
        {/* Dark Mode */}
        <div className="p-6 rounded-2xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-3">
          <span className="text-xs font-mono text-raycast-dark-subtle">Raycast Dark Dropdown</span>
          <Dropdown
            value={darkVal}
            options={sampleOptions}
            onChange={setDarkVal}
            icon={<Hash className="w-3.5 h-3.5 text-raycast-amber" />}
          />
        </div>

        {/* Light Mode */}
        <div className="p-6 rounded-2xl bg-raycast-light-bg border border-raycast-light-border flex flex-col gap-3">
          <span className="text-xs font-mono text-raycast-light-subtle">Raycast Light (Ivory) Dropdown</span>
          <Dropdown
            value={lightVal}
            options={sampleOptions}
            onChange={setLightVal}
            icon={<BookOpen className="w-3.5 h-3.5 text-emerald-500" />}
          />
        </div>
      </div>
    );
  },
};
