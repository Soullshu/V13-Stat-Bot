const { Client, Collection, Intents } = require("discord.js");
const client = (global.client = new Client({
	fetchAllMembers: true,
	intents: [
    Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS
	]
}));
const settings = require("./src/configs/settings.json");
const { Database } = require("ark.db");
global.confdb = new Database("./src/configs/config.json");
client.commands = new Collection();
client.cooldown = new Map();

require("./src/handlers/commandHandler");
require("./src/handlers/eventHandler");
require("./src/handlers/mongoHandler");
require("./src/handlers/functionHandler")(client);
setInterval(() => {
	client.user.setPresence({ activities: [{ type: "STREAMING", url: "https://www.twitch.tv/soullxdd", name: "Soull ❤️" }]})
}, 15000);


	client
	.login(settings.token)
	.then(() => console.log("[BOT] Bot connected!"))
	.catch(() => console.log("[BOT] Bot can't connected!"));
