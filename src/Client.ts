/*
    Ch1llDev / KingCh1ll

    CODE INSPIRED BY ZEROTWODISCORD's STATCORD.js MODULE
    https://github.com/ZeroTwoDiscord/statcord.js
*/

import { Client, Guild } from "discord.js";
import sysInfo from "systeminformation";

import { ClientOptions, Response } from "bottracker.js";

function checkVar(name: string, variable: unknown, check: "exists" | "isString" | "isNumber") {
    if (check === "exists" && !variable) {
        throw new Error(`"${name}" was not provided or undefined.`);
        return false;
    } else if (check === "isString" && typeof variable !== "string") {
        throw new Error(`"${name}" is not a string.`);
        return false;
    } else if (check === "isNumber" && typeof variable !== "number") {
        throw new Error(`"${name}" is not a number.`);
        return false;
    } 

    return true;
}

export default class BotTrackerClient {
    private client: Client;
    private options: ClientOptions | null = null;

    // OTHER
    private sharding = false;
    private bandwidth = 0;
    private commandsRun = 0;
    private popular: { name: string, count: number }[] = [];
    private users: string[] = [];

    constructor(options: ClientOptions) {
        try {
            require("discord.js");
        } catch (err) {
            throw new Error("BotTracker.js only supports Discord.js at the moment.")
        }

        const { key, client } = options;
        checkVar("key", key, "exists");
        checkVar("key", key, "isString");
        if (key.startsWith("bottracker-") !== true) throw new Error(`"key": invalid. Key doesn't start with "bottracker-"`);
        checkVar("client", client, "exists");

        if (!options.stats) options.stats = {};
        if (options.stats?.postCPU === null || options.stats?.postCPU === undefined) options.stats.postCPU = true;
        if (typeof options.stats?.postCPU !== "boolean") throw new Error("\"postCPU\" is not a boolean.");

        if (options.stats?.postMemory === null || options.stats?.postMemory === undefined) options.stats.postMemory = true;
        if (typeof options.stats?.postMemory !== "boolean") throw new Error("\"postMemory\" is not a boolean.");

        if (options.stats?.postNetwork === null || options.stats?.postNetwork === undefined) options.stats.postNetwork = true;
        if (typeof options.stats?.postNetwork !== "boolean") throw new Error("\"postNetwork\" is not a boolean.");

        this.client = client;
        this.options = options;

        if (this?.client.shard) {
            this.sharding = true;
            throw new Error("Please use the bottracker sharding client if you want to use sharding.");
        } else this.sharding = false;
    };

    /**
     * Manual post data
     * @returns {Promise<boolean | Error>} Returns true if worked, returns error if it didn't.
     */
    public async post() {
        if (this.sharding) throw new Error("Please use the bottracker sharding client if you want to use sharding.");

        let servers = this.client?.guilds.cache.size;
        let users = this.client?.guilds.cache.filter((guild: Guild) => guild.available).reduce((prev: number, current: Guild) => prev + current.memberCount, 0);

        let memory = 0, memoryLoad = 0;
        if (this.options?.stats?.postMemory) {
            memory = process.memoryUsage().heapUsed;
            memoryLoad = Math.round(process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100);
        }

        let cpuLoad = 0;
        if (this.options?.stats?.postCPU) {
            try {
                const load = await sysInfo.currentLoad();
                cpuLoad = Math.round(load.currentLoad);
            } catch (err) {}
        };

        let bandwidth = 0;
        if (this.options?.stats?.postNetwork) {
            if (this.bandwidth <= 0) this.bandwidth = (await sysInfo.networkStats()).reduce((prev, current) => prev + current.rx_bytes, 0);

            const network = await sysInfo.networkStats();
            let used_bytes_latest = network.reduce((prev, current) => prev + current.rx_bytes, 0);
            bandwidth = used_bytes_latest - this.bandwidth;
            this.bandwidth = used_bytes_latest;
        };

        const popular = [];
        const sortedPop = this.popular.sort((a, b) => a.count - b.count).reverse();
        for (let i = 0; i < sortedPop.length; i++) popular.push({ name: sortedPop[i].name, count: sortedPop[i].count });

        this.commandsRun = 0;
        this.users = [];
        this.popular = [];

        await fetch("https://api.bottracker.xyz/stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: this.client.user?.id as string,
                key: this.options?.key,
                active: this.users,
                commands: this.commandsRun,
                servers, users, popular,
                resources: { memory, memoryLoad, cpuLoad, bandwidth }
            })
        }).then(res => res.status === 200 ? res.json() : null).then(res => {
            const body = res as Response;
            if (body?.success !== true) throw new Error(`[BotTracker.js]: Failed to publish stats (${body.status}). ${body.message}`);
        });
    };

    /**
     * Autoposts data
     */
    async autopost() {
        if (this.sharding) throw new Error("Please use the bottracker sharding client if you want to use sharding.");

        const post = await this.post();
        setInterval(async () => await this.post(), 60 * 1000);

        return Promise.resolve(post);
    };

    /**
     * Post Stats For Command
     */
    async postCommand(name: string, author: string) {
        if (this.sharding) throw new Error("Please use the bottracker sharding client if you want to use sharding.");

        checkVar("Command Name", name, "exists");
        checkVar("Command Name", name, "isString");
        checkVar("Command Author", name, "exists");
        checkVar("Command Author", name, "isNumber");

        if (!this.users.includes(author)) this.users.push(author);
        if (!this.popular.some(command => command.name == name))  this.popular.push({ name, count: 1 });
        else this.popular[this.popular.findIndex(command => command.name == name)].count++;
        this.commandsRun++;
    }
}