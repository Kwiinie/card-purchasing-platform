export default async function createTransaction(ctx, data, paymentMethod) {
  if (paymentMethod === 'zalopay') {
    try {
      const res = await ctx.call('zalopay.createPaymentRequest', {
        amount: data.amount,
        orderInfo: data.orderInfo,
      })
      return res
    } catch (error) {
      throw error
    }
  } else if (paymentMethod === 'momo') {
    try {
      const res = await ctx.call('momo.createPaymentRequest', {
        amount: data.amount,
        orderInfo: data.orderInfo,
      })
      return res
    } catch (error) {
      throw error
    }
  } else {
    throw new Error('Invalid payment method')
  }
}
