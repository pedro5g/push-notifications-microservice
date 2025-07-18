# push-notifications-microservice

├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── push.ts
│   ├── controllers/
│   │   ├── webhook.controller.ts
│   │   ├── subscription.controller.ts
│   │   └── notification.controller.ts
│   ├── services/
│   │   ├── webhook.service.ts
│   │   ├── push.service.ts
│   │   ├── subscription.service.ts
│   │   └── queue.service.ts
│   ├── repositories/
│   │   ├── webhook.repository.ts
│   │   ├── subscription.repository.ts
│   │   └── notification.repository.ts
│   ├── models/
│   │   ├── webhook.model.ts
│   │   ├── subscription.model.ts
│   │   └── notification.model.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/
│   │   ├── webhook.validator.ts
│   │   ├── subscription.validator.ts
│   │   └── notification.validator.ts
│   ├── jobs/
│   │   ├── notification.job.ts
│   │   └── cleanup.job.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   └── retry.ts
│   ├── types/
│   │   ├── webhook.types.ts
│   │   ├── subscription.types.ts
│   │   └── notification.types.ts
│   ├── routes/
│   │   ├── webhook.routes.ts
│   │   ├── subscription.routes.ts
│   │   └── notification.routes.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
|── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
