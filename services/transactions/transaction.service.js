'use strict'
import createTransaction from '../../handlers/transactions/create-transaction.handler.js'
import updateTransaction from '../../handlers/transactions/update-transaction.handler.js'
import dbMixin from '../../mixins/db.mixin.js'

const TransactionService = {
  name: 'transaction',
  mixins: dbMixin('transactions'),
  collection: 'transactions',

  settings: {
    fields: [
      '_id',
      'transactionId',
      'amount',
      'paymentMethod',
      'orderInfo',
      'paymentDate',
      'isSuccess',
      'createdAt',
      'updatedAt',
    ],
    entityValidator: {
      transactionId: { type: 'string', optional: true },
      amount: { type: 'number', positive: true, integer: true, required: true },
      paymentMethod: { type: 'enum', values: ['momo', 'zalopay'], required: true },
      transactionStatus: {
        type: 'enum',
        values: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELED', 'UNKNOWN'],
        required: true,
      },
      orderInfo: { type: 'string', optional: true },
      paymentDate: { type: 'date', optional: true },
      returnMessage: { type: 'string', optional: true },
      responseCode: { type: 'number', optional: true },
    },
  },

  actions: {
    create: {
      rest: 'POST ',
      params: {
        orderId: { type: 'string', required: true },
        paymentMethod: { type: 'enum', values: ['momo', 'zalopay'], required: true },
      },
      async handler(ctx) {
        const { orderId, paymentMethod } = ctx.params
        const order = await this.broker.call('order.get', { id: orderId })
        if (!order) throw new Error('Order not found')
        if (order.paymentId) throw new Error('Order already paid')

        const data = {
          amount: order.totalPrice,
          paymentMethod,
          transactionId: null,
          orderInfo: `Payment for order ${ctx.params.orderId}`,
          transactionStatus: 'PENDING',
          createdAt: ctx.params.createdAt,
          updatedAt: ctx.params.updatedAt,
        }
        const res = await createTransaction(ctx, data, paymentMethod)
        paymentMethod === 'momo'
          ? (data.transactionId = res.orderId)
          : (data.transactionId = res.order.app_trans_id)
        this.adapter.insert(data)

        await this.broker.call('order.update', {
          id: orderId,
          paymentId: data._id,
        })

        return res
      },
    },

    updateTransaction: {
      params: {
        transactionId: { type: 'string', required: true },
        transactionStatus: {
          type: 'enum',
          values: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELED', 'REFUND', 'UNKNOWN'],
          required: true,
        },
        returnMessage: { type: 'string', required: true },
        responseCode: { type: 'number', required: true },
        paymentDate: { type: 'date', optional: true },
      },
      async handler(ctx) {
        return await updateTransaction.call(this, ctx)
      },
    },
  },
}

export default TransactionService
