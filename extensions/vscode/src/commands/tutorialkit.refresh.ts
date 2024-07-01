import { getLessonsTreeDataProvider } from '../views/lessonsTree';

export default () => {
  getLessonsTreeDataProvider().refresh();
};
