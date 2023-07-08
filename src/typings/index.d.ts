declare module "bottracker.js" {
    import * as Discord from "discord.js";
    import * as Cluster from "discord-hybrid-sharding";
    import * as Cluster2 from "status-sharding";

    export interface BaseOptions {
        key: string,
        stats?: {
            postCPU?: boolean,
            postMemory?: boolean,
            postNetwork?: boolean
        }
    };

    export interface ClusterOptions extends BaseOptions {
        manager: Cluster.ClusterManager | Cluster2.ClusterManager,
        autopost?: boolean
    }

    export interface ClientOptions extends BaseOptions {
        client: Discord
    }

    export interface Response {
        success: boolean,
        status: number,
        message: string
    };

    export class BaseClient {
        private options: ClientOptions | null = null;

        // OTHER
        private bandwidth = 0;
        private commandsRun = 0;
        private popular: { name: string, count: number }[] = [];
        private users: number[] = [];

        // FUNCTIONS
        public static post(client: Discord.Client): void;
        public static postCommand(name: string, author: string, client: Discord.Client): void; 

        public post(): Promise<void>;
        private postCommand(name: string, author: string): Promise<void>;
    }

    export class ClusterClient extends BaseClient {
        private manager: Cluster.ClusterManager | Cluster2.ClusterManager;
        constructor(options: ClusterOptions);
    }

    export class Client extends BaseClient {
        private client: Discord.Client;
        private sharding = false;
        constructor(options: ClusterOptions);
    }
}