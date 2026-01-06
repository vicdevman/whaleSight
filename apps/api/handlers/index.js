import registerMessageHandler from './message.js'
import registerCallbackQuery from './callbackQuery.js'

export function registerAllHandlers(bot) {
registerMessageHandler(bot)
registerCallbackQuery(bot)
}