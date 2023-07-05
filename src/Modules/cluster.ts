import { Guild, Channel, GuildTextBasedChannel, BaseMessageOptions, User, PermissionResolvable, GuildMember, Colors, Client } from "discord.js";
import { ClusterClient, ClusterManager, DjsDiscordClient } from "discord-hybrid-sharding";

/**
* Get's all of the bot's guilds and counts them up.
* @returns {string} Server count
*/
export async function serverCount(manager: ClusterClient<DjsDiscordClient> | ClusterManager, version: 14 | 13 | 12) {
	let results;
	if (version === 12) results = await manager.fetchClientValues("guilds.cache.size");
	else results = await manager.broadcastEval((c: Client) => c.guilds.cache.size);
	return results.reduce((prev: number, val: number) => prev + val, 0);
};

/**
* Returns the current user count.
* @returns {string} User count
*/
export async function userCount(manager: ClusterClient<DjsDiscordClient> | ClusterManager, version: 14 | 13 | 12) {
	let results;
	if (version === 12) results = await manager.broadcastEval("this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)")
	else results = await manager.broadcastEval((c: Client) => c.guilds.cache.map(server => server.memberCount));

	return results.reduce((prev: number, val: number) => prev + val, 0);
};
