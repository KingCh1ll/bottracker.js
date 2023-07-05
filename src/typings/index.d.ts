import { Client, DjsDiscordClient } from "discord.js";
import { ClusterManager } from "discord-hybrid-sharding";
import { ClusterManager } from "status-sharding";

export interface Options {
    key: string,
    client: Client,
    stats?: {
        postCPU?: boolean,
        postMemory?: boolean,
        postNetwork?: boolean
    }
};

export interface ClusterOptions {
    key: string,
    manager: ClusterManager | ClusterManager,
    autopost?: boolean,
    stats?: {
        postCPU?: boolean,
        postMemory?: boolean,
        postNetwork?: boolean
    }
}

export interface Response {
    success: boolean,
    status: number,
    message: string
};
