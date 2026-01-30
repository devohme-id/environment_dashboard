const fastify = require('fastify')({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    }
});
const cors = require('@fastify/cors');
const { validatorCompiler, serializerCompiler } = require('fastify-type-provider-zod');
require('dotenv').config();

// Register Plugins
fastify.register(cors, {
    origin: true // Allow all origins for development
});

fastify.register(require('@fastify/compress'), { global: true });

fastify.register(require('@fastify/redis'), {
    url: process.env.REDIS_URL,
    connectTimeout: 5000, // Fail fast
    maxRetriesPerRequest: 1
});

fastify.register(require('@fastify/caching'), {
    privacy: 'private',
    expiresIn: 300
});

fastify.register(require('@fastify/under-pressure'), {
    maxEventLoopDelay: 2000,
    maxHeapUsedBytes: 500000000, // 500MB
    maxRssBytes: 500000000, // 500MB
    maxEventLoopUtilization: 0.98,
    exposeStatusRoute: true
});

// Simple Health Check (Plugin Independent)
fastify.get('/ping', async () => 'pong');

// Root Route
fastify.get('/', async () => {
    return {
        service: 'Environment Dashboard Backend',
        status: 'Running',
        endpoints: {
            health: '/status',
            ping: '/ping',
            api: '/api'
        }
    };
});

// Register API Routes with Zod Compiler
fastify.register(async function (apiScope) {
    apiScope.setValidatorCompiler(validatorCompiler);
    apiScope.setSerializerCompiler(serializerCompiler);
    apiScope.register(require('./routes/api'));
}, { prefix: '/api' });

const monitoring = require('./monitoring'); // Import monitoring service

// Run the server
const start = async () => {
    try {
        monitoring.startMonitoring(fastify.redis); // Start monitoring with Redis
        await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
        // fastify.log.info(`server listening on ${fastify.server.address().port}`); // Logger handles this automatically
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
