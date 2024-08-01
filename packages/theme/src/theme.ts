import type { ConfigBase } from 'unocss';

const PRIMITIVES = {
  accent: {
    50: '#EFF9FF',
    100: '#E5F6FF',
    200: '#B6E9FF',
    300: '#75DAFF',
    400: '#2CC8FF',
    500: '#00AEF2',
    600: '#008ED4',
    700: '#0071AB',
    800: '#005F8D',
    900: '#064F74',
    950: '#17374A',
  },
  gray: {
    0: '#FFFFFF',
    50: '#F6F8F9',
    100: '#EEF0F1',
    200: '#E4E6E9',
    300: '#D2D5D9',
    400: '#AAAFB6',
    500: '#7C8085',
    600: '#565A64',
    700: '#414349',
    800: '#31343B',
    900: '#2B2D35',
    950: '#232429',
    1000: '#16181D',
  },
  positive: {
    50: '#EDFCF6',
    100: '#CEFDEB',
    200: '#A1F9DC',
    300: '#64F1CB',
    400: '#24E0B3',
    500: '#02C79F',
    600: '#00A282',
    700: '#00826B',
    800: '#006656',
    900: '#005449',
    950: '#223533',
  },
  negative: {
    50: '#FEF2F3',
    100: '#FDE6E7',
    200: '#FBD0D4',
    300: '#F7AAB1',
    400: '#F06A78',
    500: '#E84B60',
    600: '#D42A48',
    700: '#B21E3C',
    800: '#951C38',
    900: '#801B36',
    950: '#45212A',
  },
  tip: {
    50: '#FCF5FF',
    100: '#F8ECFE',
    200: '#F0D3FD',
    300: '#E7BBFC',
    400: '#DD9EFA',
    500: '#D17CF8',
    600: '#BB3DF5',
    700: '#AA0CF3',
    800: '#8B0AC7',
    900: '#660792',
    950: '#3F254B',
  },
  info: {
    50: '#EFF9FF',
    100: '#E5F6FF',
    200: '#B6E9FF',
    300: '#75DAFF',
    400: '#2CC8FF',
    500: '#00AEF2',
    600: '#008ED4',
    700: '#0071AB',
    800: '#005F8D',
    900: '#064F74',
    950: '#17374A',
  },
  warning: {
    50: '#FEFAEC',
    100: '#FCF4D9',
    200: '#F9E08E',
    300: '#F6CA53',
    400: '#ED9413',
    500: '#D2700D',
    600: '#AE4E0F',
    700: '#AE4E0F',
    800: '#8E3D12',
    900: '#753212',
    950: '#402C22',
  },
};

export const theme = {
  colors: {
    ...PRIMITIVES,
    tk: {
      background: {
        primary: 'var(--tk-background-primary)',
        secondary: 'var(--tk-background-secondary)',
        active: 'var(--tk-background-active)',
        brighter: 'var(--tk-background-brighter)',
        accent: 'var(--tk-background-accent)',
        positive: 'var(--tk-background-positive)',
        warning: 'var(--tk-background-warning)',
        negative: 'var(--tk-background-negative)',
        info: 'var(--tk-background-info)',
        tip: 'var(--tk-background-tip)',
      },
      border: {
        primary: 'var(--tk-border-primary)',
        secondary: 'var(--tk-border-secondary)',
        brighter: 'var(--tk-border-brighter)',
        accent: 'var(--tk-border-accent)',
        poisitve: 'var(--tk-border-poisitve)',
        warning: 'var(--tk-border-warning)',
        negative: 'var(--tk-border-negative)',
        info: 'var(--tk-border-info)',
        tip: 'var(--tk-border-tip)',
      },
      text: {
        primary: 'var(--tk-text-primary)',
        secondary: 'var(--tk-text-secondary)',
        disabled: 'var(--tk-text-disabled)',
        body: 'var(--tk-text-body)',
        heading: 'var(--tk-text-heading)',
        active: 'var(--tk-text-active)',
        accent: 'var(--tk-text-accent)',
        positive: 'var(--tk-text-positive)',
        warning: 'var(--tk-text-warning)',
        negative: 'var(--tk-text-negative)',
        info: 'var(--tk-text-info)',
        tip: 'var(--tk-text-tip)',
      },
      elements: {
        app: {
          backgroundColor: 'var(--tk-elements-app-backgroundColor)',
          borderColor: 'var(--tk-elements-app-borderColor)',
          textColor: 'var(--tk-elements-app-textColor)',
          linkColor: 'var(--tk-elements-app-linkColor)',
        },
        content: {
          textColor: 'var(--tk-elements-content-textColor)',
          headingTextColor: 'var(--tk-elements-content-headingTextColor)',
        },
        pageLoadingIndicator: {
          backgroundColor: 'var(--tk-elements-pageLoadingIndicator-backgroundColor)',
          shadowColor: 'var(--tk-elements-pageLoadingIndicator-shadowColor)',
        },
        topBar: {
          backgroundColor: 'var(--tk-elements-topBar-backgroundColor)',
          iconButton: {
            backgroundColor: 'var(--tk-elements-topBar-iconButton-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-topBar-iconButton-backgroundColorHover)',
            iconColor: 'var(--tk-elements-topBar-iconButton-iconColor)',
            iconColorHover: 'var(--tk-elements-topBar-iconButton-iconColorHover)',
          },
          logo: {
            color: 'var(--tk-elements-topBar-logo-color)',
            colorHover: 'var(--tk-elements-topBar-logo-colorHover)',
          },
          primaryButton: {
            backgroundColor: 'var(--tk-elements-topBar-primaryButton-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-topBar-primaryButton-backgroundColorHover)',
            textColor: 'var(--tk-elements-topBar-primaryButton-textColor)',
            textColorHover: 'var(--tk-elements-topBar-primaryButton-textColorHover)',
            iconColor: 'var(--tk-elements-topBar-primaryButton-iconColor)',
            iconColorHover: 'var(--tk-elements-topBar-primaryButton-iconColorHover)',
          },
          secondaryButton: {
            backgroundColor: 'var(--tk-elements-topBar-secondaryButton-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-topBar-secondaryButton-backgroundColorHover)',
            textColor: 'var(--tk-elements-topBar-secondaryButton-textColor)',
            textColorHover: 'var(--tk-elements-topBar-secondaryButton-textColorHover)',
            iconColor: 'var(--tk-elements-topBar-secondaryButton-iconColor)',
            iconColorHover: 'var(--tk-elements-topBar-secondaryButton-iconColorHover)',
          },
        },
        panel: {
          backgroundColor: 'var(--tk-elements-panel-backgroundColor)',
          textColor: 'var(--tk-elements-panel-textColor)',
          header: {
            backgroundColor: 'var(--tk-elements-panel-header-backgroundColor)',
            textColor: 'var(--tk-elements-panel-header-textColor)',
            iconColor: 'var(--tk-elements-panel-header-iconColor)',
          },
          headerButton: {
            backgroundColor: 'var(--tk-elements-panel-headerButton-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-panel-headerButton-backgroundColorHover)',
            textColor: 'var(--tk-elements-panel-headerButton-textColor)',
            textColorHover: 'var(--tk-elements-panel-headerButton-textColorHover)',
            iconColor: 'var(--tk-elements-panel-headerButton-iconColor)',
            iconColorHover: 'var(--tk-elements-panel-headerButton-iconColorHover)',
          },
          headerTab: {
            backgroundColor: 'var(--tk-elements-panel-headerTab-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-panel-headerTab-backgroundColorHover)',
            backgroundColorActive: 'var(--tk-elements-panel-headerTab-backgroundColorActive)',
            borderColor: 'var(--tk-elements-panel-headerTab-borderColor)',
            borderColorHover: 'var(--tk-elements-panel-headerTab-borderColorHover)',
            borderColorActive: 'var(--tk-elements-panel-headerTab-borderColorActive)',
            textColor: 'var(--tk-elements-panel-headerTab-textColor)',
            textColorHover: 'var(--tk-elements-panel-headerTab-textColorHover)',
            textColorActive: 'var(--tk-elements-panel-headerTab-textColorActive)',
            iconColor: 'var(--tk-elements-panel-headerTab-iconColor)',
            iconColorHover: 'var(--tk-elements-panel-headerTab-iconColorHover)',
            iconColorActive: 'var(--tk-elements-panel-headerTab-iconColorActive)',
          },
        },
        previews: {
          borderColor: 'var(--tk-elements-previews-borderColor)',
        },
        fileTree: {
          backgroundColor: 'var(--tk-elements-fileTree-backgroundColor)',
          backgroundColorHover: 'var(--tk-elements-fileTree-backgroundColorHover)',
          textColor: 'var(--tk-elements-fileTree-textColor)',
          textColorHover: 'var(--tk-elements-fileTree-textColorHover)',
          iconColor: 'var(--tk-elements-fileTree-iconColor)',
          iconColorHover: 'var(--tk-elements-fileTree-iconColorHover)',
          file: {
            backgroundColor: 'var(--tk-elements-fileTree-file-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-fileTree-file-backgroundColorHover)',
            backgroundColorSelected: 'var(--tk-elements-fileTree-file-backgroundColorSelected)',
            textColor: 'var(--tk-elements-fileTree-file-textColor)',
            textColorHover: 'var(--tk-elements-fileTree-file-textColorHover)',
            textColorSelected: 'var(--tk-elements-fileTree-file-textColorSelected)',
            iconColor: 'var(--tk-elements-fileTree-file-iconColor)',
            iconColorHover: 'var(--tk-elements-fileTree-file-iconColorHover)',
            iconColorSelected: 'var(--tk-elements-fileTree-file-iconColorSelected)',
          },
          folder: {
            backgroundColor: 'var(--tk-elements-fileTree-folder-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-fileTree-folder-backgroundColorHover)',
            textColor: 'var(--tk-elements-fileTree-folder-textColor)',
            textColorHover: 'var(--tk-elements-fileTree-folder-textColorHover)',
            iconColor: 'var(--tk-elements-fileTree-folder-iconColor)',
            iconColorHover: 'var(--tk-elements-fileTree-folder-iconColorHover)',
          },
        },
        navCard: {
          backgroundColor: 'var(--tk-elements-navCard-backgroundColor)',
          backgroundColorHover: 'var(--tk-elements-navCard-backgroundColorHover)',
          borderColor: 'var(--tk-elements-navCard-borderColor)',
          borderColorHover: 'var(--tk-elements-navCard-borderColorHover)',
          textColor: 'var(--tk-elements-navCard-textColor)',
          textColorHover: 'var(--tk-elements-navCard-textColorHover)',
          iconColor: 'var(--tk-elements-navCard-iconColor)',
          iconColorHover: 'var(--tk-elements-navCard-iconColorHover)',
        },
        webcontainersLink: {
          textColor: 'var(--tk-elements-webcontainersLink-textColor)',
          textColorHover: 'var(--tk-elements-webcontainersLink-textColorHover)',
        },
        editPageLink: {
          textColor: 'var(--tk-elements-editPageLink-textColor)',
          textColorHover: 'var(--tk-elements-editPageLink-textColorHover)',
          iconColor: 'var(--tk-elements-editPageLink-iconColor)',
          iconColorHover: 'var(--tk-elements-editPageLink-iconColorHover)',
          borderColor: 'var(--tk-elements-editPageLink-borderColor)',
        },
        breadcrumbs: {
          navButton: {
            iconColor: 'var(--tk-elements-breadcrumbs-navButton-iconColor)',
            iconColorHover: 'var(--tk-elements-breadcrumbs-navButton-iconColorHover)',
          },
          toggleButton: {
            backgroundColor: 'var(--tk-elements-breadcrumbs-toggleButton-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-breadcrumbs-toggleButton-backgroundColorHover)',
            backgroundColorSelected: 'var(--tk-elements-breadcrumbs-toggleButton-backgroundColorSelected)',
            borderColor: 'var(--tk-elements-breadcrumbs-toggleButton-borderColor)',
            borderColorHover: 'var(--tk-elements-breadcrumbs-toggleButton-borderColorHover)',
            borderColorSelected: 'var(--tk-elements-breadcrumbs-toggleButton-borderColorSelected)',
            textColor: 'var(--tk-elements-breadcrumbs-toggleButton-textColor)',
            textColorHover: 'var(--tk-elements-breadcrumbs-toggleButton-textColorHover)',
            textColorSelected: 'var(--tk-elements-breadcrumbs-toggleButton-textColorSelected)',
            textDividerColor: 'var(--tk-elements-breadcrumbs-toggleButton-textDividerColor)',
            textDividerColorHover: 'var(--tk-elements-breadcrumbs-toggleButton-textDividerColorHover)',
            textDividerColorSelected: 'var(--tk-elements-breadcrumbs-toggleButton-textDividerColorSelected)',
            iconColor: 'var(--tk-elements-breadcrumbs-toggleButton-iconColor)',
            iconColorHover: 'var(--tk-elements-breadcrumbs-toggleButton-iconColorHover)',
            iconColorSelected: 'var(--tk-elements-breadcrumbs-toggleButton-iconColorSelected)',
          },
          dropdown: {
            backgroundColor: 'var(--tk-elements-breadcrumbs-dropdown-backgroundColor)',
            borderColor: 'var(--tk-elements-breadcrumbs-dropdown-borderColor)',
            textColor: 'var(--tk-elements-breadcrumbs-dropdown-textColor)',
            textColorHover: 'var(--tk-elements-breadcrumbs-dropdown-textColorHover)',
            accordionTextColor: 'var(--tk-elements-breadcrumbs-dropdown-accordionTextColor)',
            accordionTextColorSelected: 'var(--tk-elements-breadcrumbs-dropdown-accordionTextColorSelected)',
            accordionTextColorHover: 'var(--tk-elements-breadcrumbs-dropdown-accordionTextColorHover)',
            accordionIconColor: 'var(--tk-elements-breadcrumbs-dropdown-accordionIconColor)',
            accordionIconColorSelected: 'var(--tk-elements-breadcrumbs-dropdown-accordionIconColorSelected)',
            accordionIconColorHover: 'var(--tk-elements-breadcrumbs-dropdown-accordionIconColorHover)',
            lessonBackgroundColor: 'var(--tk-elements-breadcrumbs-dropdown-lessonBackgroundColor)',
            lessonBackgroundColorSelected: 'var(--tk-elements-breadcrumbs-dropdown-lessonBackgroundColorSelected)',
            lessonTextColor: 'var(--tk-elements-breadcrumbs-dropdown-lessonTextColor)',
            lessonTextColorSelected: 'var(--tk-elements-breadcrumbs-dropdown-lessonTextColorSelected)',
            lessonTextColorHover: 'var(--tk-elements-breadcrumbs-dropdown-lessonTextColorHover)',
          },
        },
        bootScreen: {
          primaryButton: {
            backgroundColor: 'var(--tk-elements-bootScreen-primaryButton-backgroundColor)',
            backgroundColorHover: 'var(--tk-elements-bootScreen-primaryButton-backgroundColorHover)',
            textColor: 'var(--tk-elements-bootScreen-primaryButton-textColor)',
            textColorHover: 'var(--tk-elements-bootScreen-primaryButton-textColorHover)',
            iconColor: 'var(--tk-elements-bootScreen-primaryButton-iconColor)',
            iconColorHover: 'var(--tk-elements-bootScreen-primaryButton-iconColorHover)',
          },
        },
        status: {
          positive: {
            textColor: 'var(--tk-elements-status-positive-textColor)',
            iconColor: 'var(--tk-elements-status-positive-iconColor)',
          },
          negative: {
            textColor: 'var(--tk-elements-status-negative-textColor)',
            iconColor: 'var(--tk-elements-status-negative-iconColor)',
          },
          skipped: {
            textColor: 'var(--tk-elements-status-skipped-textColor)',
            iconColor: 'var(--tk-elements-status-skipped-iconColor)',
          },
          disabled: {
            textColor: 'var(--tk-elements-status-disabled-textColor)',
            iconColor: 'var(--tk-elements-status-disabled-iconColor)',
          },
          active: {
            textColor: 'var(--tk-elements-status-active-textColor)',
            iconColor: 'var(--tk-elements-status-active-iconColor)',
          },
        },
        markdown: {
          callouts: {
            backgroundColor: 'var(--tk-elements-markdown-callouts-backgroundColor)',
            textColor: 'var(--tk-elements-markdown-callouts-textColor)',
            borderColor: 'var(--tk-elements-markdown-callouts-borderColor)',
            titleTextColor: 'var(--tk-elements-markdown-callouts-titleTextColor)',
            iconColor: 'var(--tk-elements-markdown-callouts-iconColor)',
          },
        },
      },
    },
  },
} satisfies ConfigBase['theme'];
