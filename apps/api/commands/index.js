import registerStart from './start.js';
import registerHelp from './help.js';
import registerTrack from './track.js';
import registerScan from './scan.js';
import registerList from './list.js';
import registerRemove from './remove.js';

export function registerAllCommands(bot) {
  registerStart(bot);
  registerHelp(bot);
  registerTrack(bot);
  registerScan(bot);
  registerList(bot);
  registerRemove(bot);
}