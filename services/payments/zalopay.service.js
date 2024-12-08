'use strict'

import createZaloPayPayment from '../../handlers/payments/zalopay/create-payment.handler.js'
import callbackZaloPay from '../../handlers/payments/zalopay/callback.handler.js'
import queryZaloPayment from '../../handlers/payments/zalopay/query-payment.handler.js'

const ZalopayService = {
  name: 'zalopay',
  settings: {
    app_id: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_ENDPOINT,
    query: process.env.ZALOPAY_ENDPOINT_QUERY,
    callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
  },
  actions: {
    createPaymentRequest: {
      params: {
        amount: { type: 'number', positive: true, integer: true, required: true },
        orderInfo: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await createZaloPayPayment.call(this, ctx)
      },
    },
    callback: {
      rest: 'POST /callback',
      params: {
        data: { type: 'string', required: true },
        mac: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await callbackZaloPay.call(this, ctx)
      },
    },

    queryPayment: {
      rest: 'POST /payment/:id',
      params: {
        id: { type: 'string', objectId: true, required: true },
      },
      async handler(ctx) {
        return await queryZaloPayment.call(this, ctx)
      },
    },
  },
}

export default ZalopayService
