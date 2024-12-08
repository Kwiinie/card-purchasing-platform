'use strict'
import createAffiliateGroup from '../../handlers/affiliate-groups/create-affiliate-group.handler.js'
import dbMixin from '../../mixins/db.mixin.js'

const AffiliateGroupService = {
  name: 'affiliateGroup',
  mixins: dbMixin('affiliateGroups'),
  collection: 'affiliateGroups',
  settings: {
    fields: ['name', 'items'],
    entityValidator: {
      name: { type: 'string', required: true },
      items: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          required: ['card', 'commissionRate', 'discountRate'],
          properties: {
            card: { type: 'object', required: true },
            commissionRate: { type: 'number', positive: true, required: true, max: 100 },
            discountRate: { type: 'number', positive: true, required: true, max: 100 },
          },
        },
      },
    },
    populates: {
      card: {
        action: 'card.get',
        params: {
          fields: '*',
        },
      },
    },
  },

  actions: {
    create: {
      rest: 'POST ',
      params: {
        name: { type: 'string', required: true },
        items: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            required: ['card', 'commissionRate', 'discountRate'],
            properties: {
              cardId: { type: 'string', required: true },
              commissionRate: { type: 'number', positive: true, required: true, max: 100 },
              discountRate: { type: 'number', positive: true, required: true, max: 100 },
            },
          },
        },
      },
      async handler(ctx) {
        return await createAffiliateGroup.call(this, ctx)
      },
    },
  },
}

export default AffiliateGroupService
