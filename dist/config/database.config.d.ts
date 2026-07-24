declare const _default: (() => {
    type: "postgres";
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    poolSize: number;
    connectTimeoutMS: number;
    extra: {
        max: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
        ssl: boolean | {
            rejectUnauthorized: boolean;
        };
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: "postgres";
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    poolSize: number;
    connectTimeoutMS: number;
    extra: {
        max: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
        ssl: boolean | {
            rejectUnauthorized: boolean;
        };
    };
}>;
export default _default;
