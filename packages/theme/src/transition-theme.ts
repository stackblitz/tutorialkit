// this is a separate module with its own entrypoint so that it can be used in non-Node environment

export const transitionTheme = {
  transitionProperty: 'background-color, border-color, box-shadow',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
};
