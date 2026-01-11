import { handleStart } from './start.js';
import { handleHelp } from './help.js';
import { handleTrack } from './track.js';
import { handleScan } from './scan.js';
import { handleList } from './list.js';
import { handleRemove } from './remove.js';

export const commandHandlers = {
  '/start': handleStart,
  '/help': handleHelp,
  '/track': handleTrack,
  '/scan': handleScan,
  '/list': handleList,
  '/remove': handleRemove
};