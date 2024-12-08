import { ObjectId } from 'mongodb'

export default async function updateTransaction(ctx) {
  const { transactionId, transactionStatus, returnMessage, responseCode, paymentDate } = ctx.params
  await this.adapter.updateMany(
    { transactionId: transactionId },
    {
      $set: {
        transactionStatus,
        returnMessage,
        responseCode,
        updatedAt: new Date(),
        paymentDate,
      },
    },
  )

  const transactions = await this.broker.call('transaction.find', {
    query: { transactionId: transactionId },
  })
  const transaction = transactions[0]

  const orders = await this.broker.call('order.find', {
    query: { paymentId: ObjectId.createFromHexString(transaction._id) },
  })
  const order = orders[0]
  const affiliates = await this.broker.call('user.find', {
    query: { affiliateCode: order.affiliateCode },
  })
  const affiliateUser = affiliates[0]
  console.log('order', order)
  const orderItems = order.items

  let totalCommission = 0
  let totalCommissionUser = affiliateUser.totalCommission
  let totalCommissionOrderUser = affiliateUser.totalCommissionOrder

  if (transactionStatus === 'SUCCESS') {
    await this.broker.call('order.update', {
      id: ObjectId.createFromHexString(order._id),
      status: 'SUCCESS',
    })
    for (let item of orderItems) {
      const card = await this.broker.call('card.get', { id: item.card._id })
      console.log('card: ', card)

      // Find the card in the affiliate group's cards list
      const affiliateCard = affiliateUser.affiliateGroup.items.find(
        affCard => affCard.card._id === item.card._id,
      )
      console.log('affiliateCard: ', affiliateCard)

      if (affiliateCard) {
        // Calculate commission based on card price and commission rate
        const commission =
          affiliateCard.card.price * item.quantity * (affiliateCard.commissionRate / 100)
        totalCommission += commission
      }
    }
    console.log('totalCommission: ', totalCommission)
    console.log('user:', affiliateUser)
    totalCommissionUser += totalCommission
    console.log('totalCommissionUser:', totalCommissionUser)
    totalCommissionOrderUser += 1
    console.log(typeof affiliateUser._id)
    await this.broker.call('user.update', {
      id: affiliateUser._id,
      totalCommission: totalCommissionUser,
      totalCommissionOrder: totalCommissionOrderUser,
    })
  } else {
    await this.broker.call('order.update', {
      id: ObjectId.createFromHexString(order._id),
      status: 'FAILED',
    })
    for (let item of orderItems) {
      console.log('item: ', item)
      const card = await this.broker.call('card.get', { id: item.card._id })
      console.log('card: ', card)
      const available = card.available + item.quantity
      await this.broker.call('card.update', {
        id: card._id,
        available,
      })
    }
  }

  return { message: ' update order successfully!' }
}
