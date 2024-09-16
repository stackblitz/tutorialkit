import { parentPort } from 'node:worker_threads';
import { contentSchema } from '@tutorialkit/types';
import { zodToJsonSchema } from 'zod-to-json-schema';

parentPort.postMessage(zodToJsonSchema(contentSchema));
