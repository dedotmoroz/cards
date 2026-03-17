import type { Core } from '@strapi/strapi';

async function ensurePublicPermission(strapi: Core.Strapi, action: string) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' }, select: ['id'] });

  if (!publicRole?.id) return;

  const existing = await strapi.db
    .query('plugin::users-permissions.permission')
    .findOne({
      where: { role: publicRole.id, action },
      select: ['id'],
    });

  if (existing?.id) return;

  await strapi.db.query('plugin::users-permissions.permission').create({
    data: {
      role: publicRole.id,
      action,
    },
  });
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensurePublicPermission(strapi, 'api::ecosystem.ecosystem.find');
    await ensurePublicPermission(strapi, 'api::ecosystem.ecosystem.findOne');
  },
};
