export class Lesson {
  constructor(
    public name: string,
    readonly path: string,
    readonly children: Lesson[] = [],
    public metadata?: {
      _path: string;
      title: string;
      type: LessonType;
      description?: string;
    },
  ) {}
}

export type LessonType = 'lesson' | 'chapter' | 'part';
