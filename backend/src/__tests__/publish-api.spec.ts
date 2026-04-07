import { FastifyInstance } from 'fastify';
import { buildServer } from '../adapters/http/build-server';
import request from 'supertest';

describe('POST /publish/page (e2e)', () => {
    let fastify: FastifyInstance;
    const originalFetch = global.fetch;
    let mockFetch: jest.Mock;

    beforeAll(async () => {
        process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_publish_spec';
        process.env.STRAPI_API_TOKEN = 'test-strapi-token';
        process.env.STRAPI_CMS_URL = 'https://cms.example.com';

        mockFetch = jest.fn();
        global.fetch = mockFetch as unknown as typeof fetch;

        fastify = await buildServer();
        await fastify.listen({ port: 0 });
    });

    afterAll(async () => {
        await fastify.close();
        global.fetch = originalFetch;
        delete process.env.STRAPI_API_TOKEN;
        delete process.env.STRAPI_CMS_URL;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('публикует страницу и возвращает slug и id', async () => {
        mockFetch.mockResolvedValue(
            new Response(
                JSON.stringify({
                    data: {
                        id: 7,
                        attributes: { slug: 'my-title-999' },
                    },
                }),
                { status: 201 },
            ),
        );

        const res = await request(fastify.server).post('/publish/page').send({
            title: 'My Title',
            content: 'Hello body',
            locale: 'en',
        });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            id: 7,
            slug: 'my-title-999',
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, init] = mockFetch.mock.calls[0];
        expect(String(url)).toBe('https://cms.example.com/api/pages?locale=en');
        expect(init?.method).toBe('POST');
        const sent = JSON.parse((init?.body as string) ?? '{}');
        expect(sent.data.title).toBe('My Title');
        expect(sent.data.locale).toBe('en');
        expect(sent.data.content[0].children[0].text).toBe('Hello body');
        expect(sent.data.content[0].children[0].type).toBe('text');
        expect(sent.data.slug).toMatch(/^my-title-\d+$/);
    });

    it('возвращает 400 при невалидном теле', async () => {
        const res = await request(fastify.server).post('/publish/page').send({
            title: '',
            content: 'x',
        });

        expect(res.status).toBe(400);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('возвращает 502 при ошибке Strapi', async () => {
        mockFetch.mockResolvedValue(new Response('upstream error', { status: 400 }));

        const res = await request(fastify.server).post('/publish/page').send({
            title: 'Valid',
            content: 'Content here',
        });

        expect(res.status).toBe(502);
        expect(res.body.message).toBe('Failed to publish page to CMS');
    });

    it('передаёт locale в query для Strapi i18n', async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ data: { id: 1, attributes: { slug: 'x' } } }), { status: 201 }),
        );

        const res = await request(fastify.server).post('/publish/page').send({
            title: 'Título',
            content: 'Hola',
            locale: 'es',
        });

        expect(res.status).toBe(201);
        expect(String(mockFetch.mock.calls[0][0])).toBe('https://cms.example.com/api/pages?locale=es');
    });
});

describe('POST /publish/collection (e2e)', () => {
    let fastify: FastifyInstance;
    const originalFetch = global.fetch;
    let mockFetch: jest.Mock;

    beforeAll(async () => {
        process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_publish_spec';
        process.env.STRAPI_API_TOKEN = 'test-strapi-token';
        process.env.STRAPI_CMS_URL = 'https://cms.example.com';

        mockFetch = jest.fn();
        global.fetch = mockFetch as unknown as typeof fetch;

        fastify = await buildServer();
        await fastify.listen({ port: 0 });
    });

    afterAll(async () => {
        await fastify.close();
        global.fetch = originalFetch;
        delete process.env.STRAPI_API_TOKEN;
        delete process.env.STRAPI_CMS_URL;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('публикует коллекцию и возвращает slug и id', async () => {
        mockFetch.mockResolvedValue(
            new Response(
                JSON.stringify({
                    data: {
                        id: 'doc1',
                        attributes: { slug: 'my-deck' },
                    },
                }),
                { status: 201 },
            ),
        );

        const words = [
            { term: 'hello', translation: 'привет' },
            { term: 'world', translation: 'мир' },
        ];

        const res = await request(fastify.server).post('/publish/collection').send({
            title: 'My deck',
            slug: 'my-deck',
            words,
            locale: 'en',
        });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            id: 'doc1',
            slug: 'my-deck',
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, init] = mockFetch.mock.calls[0];
        expect(String(url)).toBe('https://cms.example.com/api/collections?locale=en');
        const sent = JSON.parse((init?.body as string) ?? '{}');
        expect(sent.data.title).toBe('My deck');
        expect(sent.data.slug).toBe('my-deck');
        expect(sent.data.words).toEqual(words);
        expect(sent.data.locale).toBe('en');
        expect(sent.data.publishedAt).toBeDefined();
    });

    it('принимает words как массив строк', async () => {
        mockFetch.mockResolvedValue(
            new Response(
                JSON.stringify({
                    data: { id: 1, attributes: { slug: 'a-b' } },
                }),
                { status: 201 },
            ),
        );

        const res = await request(fastify.server).post('/publish/collection').send({
            title: 'T',
            slug: 'a-b',
            words: ['cat', 'dog'],
        });

        expect(res.status).toBe(201);
        expect(String(mockFetch.mock.calls[0][0])).toBe(
            'https://cms.example.com/api/collections?locale=en',
        );
        const sent = JSON.parse((mockFetch.mock.calls[0][1]?.body as string) ?? '{}');
        expect(sent.data.words).toEqual(['cat', 'dog']);
    });

    it('передаёт locale в query для Strapi i18n', async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ data: { id: 1, attributes: { slug: 'x' } } }), { status: 201 }),
        );

        const res = await request(fastify.server).post('/publish/collection').send({
            title: 'T',
            slug: 'x',
            words: [],
            locale: 'es',
        });

        expect(res.status).toBe(201);
        expect(String(mockFetch.mock.calls[0][0])).toBe(
            'https://cms.example.com/api/collections?locale=es',
        );
    });

    it('возвращает 502 при ошибке Strapi', async () => {
        mockFetch.mockResolvedValue(new Response('bad', { status: 400 }));

        const res = await request(fastify.server).post('/publish/collection').send({
            title: 'T',
            slug: 'slug',
            words: [],
        });

        expect(res.status).toBe(502);
        expect(res.body.message).toBe('Failed to publish collection to CMS');
    });
});
