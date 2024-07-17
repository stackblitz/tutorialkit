import { parentPort } from 'node:worker_threads';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { chapterSchema, lessonSchema, partSchema, tutorialSchema } from '@tutorialkit/types';

const schema = tutorialSchema.strict().or(partSchema.strict()).or(chapterSchema.strict()).or(lessonSchema.strict());

parentPort.postMessage(zodToJsonSchema(schema));
