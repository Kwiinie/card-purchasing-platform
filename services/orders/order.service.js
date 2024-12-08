'use strict'

import dbMixin from '../../mixins/db.mixin.js'
import createOrder from '../../handlers/orders/create-order.handler.js'
import updateTransaction from '../../handlers/transactions/update-transaction.handler.js'
import requestOrder from '../../handlers/orders/request-order.handler.js'
import findOrders from '../../handlers/orders/find-order.handler.js'

const OrderService = {
  name: 'order',
  mixins: dbMixin('orders'),
  collection: 'orders',

  settings: {
    fields: [
      '_id',
      'phone',
      'email',
      'totalPrice',
      'paymentId',
      'items',
      'affiliateCode',
      'affiliateGroup',
      'paymentFee',
      'status',
    ],
    entityValidator: {
      phone: { type: 'string', required: true, pattern: /^0\d{9}$/ },
      email: {
        type: 'string',
        required: true,
        pattern: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
      },
      totalPrice: { type: 'number', positive: true, required: true },
      paymentId: { type: 'string', optional: true },
      items: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          required: ['card', 'commissionRate', 'discountRate'],
          properties: {
            card: { type: 'object', required: true },
            discountRate: { type: 'number', positive: true, required: true, max: 100 },
            quantity: { type: 'number', positive: true, required: true },
            price: { type: 'number', positive: true, required: true },
          },
        },
      },
      affiliateCode: { type: 'string', optional: true },
      affiliateGroup: { type: 'object', optional: true },
      paymentFee: { type: 'number', positive: true, required: true },
      status: { type: 'enum', values: ['PENDING', 'SUCCESS', 'FAILED'], required: true },
    },
  },

  actions: {
    create: {
      rest: 'POST /:affiliateCode?',
      params: {
        phone: { type: 'string', required: true, pattern: /^0\d{9}$/ },
        email: {
          type: 'string',
          required: true,
          pattern: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
        },
        items: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            required: ['card', 'quantity'],
            properties: {
              cardId: { type: 'string', required: true },
              quantity: { type: 'number', positive: true, required: true },
            },
          },
        },
        affiliateCode: { type: 'string', optional: true },
      },
      async handler(ctx) {
        return await createOrder.call(this, ctx)
      },
    },
    requestOrders: {
      rest: 'POST /request',
      params: {
        contact: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await requestOrder.call(this, ctx)
      },
    },
    findOrders: {
      rest: 'GET /findOrders',
      params: {
        contact: { type: 'string', required: true },
        otp: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await findOrders.call(this, ctx)
      },
    },
  },
}

export default OrderService
