/**
 * This code must be executed before the `@webcontainer/api` module.
 */
if (__SELF_HOSTED__) {
  (window as any).WEBCONTAINER_API_IFRAME_URL = __WC_CONFIG__!.editorOrigin;
}
