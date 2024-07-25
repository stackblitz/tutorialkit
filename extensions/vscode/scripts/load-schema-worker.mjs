import { parentPort } from 'node:worker_threads';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { contentSchema } from '@tutorialkit/types';

parentPort.postMessage(zodToJsonSchema(contentSchema));
