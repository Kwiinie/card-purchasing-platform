import getTransactionState from '../../../utils/transaction-state.util.js'

export default async function callbackMomo(ctx) {
  console.log('callback:')
  console.log(ctx.params)
  console.log('orderId =', ctx.params.orderId)
  const result = await ctx.call('momo.queryPayment', { id: ctx.params.orderId })
  const transactionState = getTransactionState('momo', result.resultCode)
  console.log('trang thai ne:', transactionState)
  console.log('result ne:', result)
  ctx.call('transaction.updateTransaction', {
    transactionId: ctx.params.orderId,
    transactionStatus: transactionState,
    returnMessage: ctx.params.message,
    responseCode: ctx.params.resultCode,
    paymentDate: new Date(),
  })
}
