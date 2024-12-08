'use strict'

import createCard from '../../handlers/cards/create-card.handler.js'
import updateQuantity from '../../handlers/cards/update-quantity.handler.js'
import dbMixin from '../../mixins/db.mixin.js'

const CardService = {
  name: 'card',
  mixins: dbMixin('cards'),
  collection: 'cards',

  settings: {
    fields: [
      '_id',
      'type',
      'supplier',
      'faceValue',
      'price',
      'available',
      'createdAt',
      'updatedAt',
    ],
    entityValidator: {
      type: { type: 'enum', values: ['phoneCard', 'gameCard'], required: true },
      supplier: { type: 'object', required: true },
      faceValue: { type: 'number', positive: true, integer: true, required: true },
      price: { type: 'number', positive: true, integer: true, required: true },
      available: { type: 'number', positive: true, integer: true, required: true },
    },
    populates: {
      supplier: {
        action: 'supplier.get',
        params: {
          fields: 'name',
        },
      },
    },
  },

  actions: {
    create: {
      rest: 'POST ',
      params: {
        type: { type: 'enum', values: ['phoneCard', 'gameCard'], required: true },
        supplierId: { type: 'string', required: true },
        faceValue: { type: 'number', positive: true, integer: true, required: true },
        price: { type: 'number', positive: true, integer: true, required: true },
        available: { type: 'number', positive: true, integer: true, required: true },
      },
      auth: 'activated',
      role: 'admin',
      async handler(ctx) {
        return await createCard.call(this, ctx)
      },
    },
    updateQuantity: {
      rest: 'PATCH /update-quantity',
      params: {
        cardId: { type: 'string', objectId: true, required: true },
        quantity: { type: 'number', positive: true, integer: true, required: true },
      },
      auth: 'activated',
      role: 'admin',
      async handler(ctx) {
        return await updateQuantity.call(this, ctx)
      },
    },
  },
}

export default CardService
