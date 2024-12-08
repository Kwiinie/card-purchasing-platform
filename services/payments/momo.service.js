import createMomoPayment from '../../handlers/payments/momo/create-payment.handler.js'
import queryMomoPayment from '../../handlers/payments/momo/query-payment.handler.js'
import callbackMomo from '../../handlers/payments/momo/callback.handler.js'

const MomoService = {
  name: 'momo',
  settings: {
    accessKey: process.env.MOMO_ACCESSKEY,
    secretKey: process.env.MOMO_SECRETKEY,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
  },
  actions: {
    createPaymentRequest: {
      params: {
        amount: { type: 'number', positive: true, integer: true, required: true },
        orderInfo: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await createMomoPayment.call(this, ctx)
      },
    },
    callback: {
      rest: 'POST /callback',
      params: {},
      async handler(ctx) {
        return await callbackMomo.call(this, ctx)
      },
    },
    queryPayment: {
      rest: 'POST /payment/:id',
      params: {
        id: { type: 'string', objectId: true, required: true },
      },
      async handler(ctx) {
        return await queryMomoPayment.call(this, ctx)
      },
    },
  },
}

export default MomoService
