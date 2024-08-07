import { getLessonsTreeDataProvider } from '../global-state';

export default () => {
  getLessonsTreeDataProvider().refresh();
};
