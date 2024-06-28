import type { ConfigBase } from 'unocss';

export { theme } from './theme.js';

export const rules: ConfigBase['rules'] = [
  ['scrollbar-transparent', { 'scrollbar-color': '#0000004d transparent' }],
  ['nav-box-shadow', { 'box-shadow': '0 2px 4px -1px rgba(0, 0, 0, 0.1)' }],
  ['transition-background', { 'transition-property': 'background' }],
];

export const shortcuts: ConfigBase['shortcuts'] = {
  'panel-container': 'grid grid-rows-[min-content_1fr] h-full',
  'panel-header':
    'flex items-center px-4 py-2 bg-tk-elements-panel-header-backgroundColor min-h-[38px] overflow-x-hidden',
  'panel-tabs-header': 'flex bg-tk-elements-panel-header-backgroundColor h-[38px]',
  'panel-title': 'flex items-center gap-1.5 text-tk-elements-panel-header-textColor',
  'panel-icon': 'text-tk-elements-panel-header-iconColor',
  'panel-button':
    'flex items-center gap-1.5 whitespace-nowrap rounded-md text-sm bg-tk-elements-panel-headerButton-backgroundColor hover:bg-tk-elements-panel-headerButton-backgroundColorHover text-tk-elements-panel-headerButton-textColor hover:text-tk-elements-panel-headerButton-textColorHover',
};
