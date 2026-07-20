declare const _default: (() => {
    host: string;
    port: number;
    password: string | undefined;
    cacheDb: number;
    queueDb: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string | undefined;
    cacheDb: number;
    queueDb: number;
}>;
export default _default;
