import { ObjectId } from 'mongodb'

export default async function createOrder(ctx) {
  const { phone, email, items, affiliateCode } = ctx.params
  let affiliateGroup
  if (affiliateCode) {
    const userAffiliates = await this.broker.call('user.find', {
      query: { affiliateCode: affiliateCode },
    })
    const userAffiliate = userAffiliates[0]
    if (!userAffiliate || !userAffiliate.isAffiliate) {
      throw new Error('Affiliate code not found')
    }
    const userPhones = await this.broker.call('user.find', { query: { phone } })
    const userPhone = userPhones[0]
    const userEmails = await this.broker.call('user.find', { query: { email } })
    const userEmail = userEmails[0]
    if (
      (userPhone && userPhone.affiliateCode === affiliateCode) ||
      (userEmail && userEmail.affiliateCode === affiliateCode)
    ) {
      throw new Error('Cannot use your own affiliate code!')
    } else {
      affiliateGroup = userAffiliate.affiliateGroup
    }
  }
  const cardIds = items.map(item => item.cardId)
  const uniqueCardIds = new Set(cardIds)

  if (cardIds.length !== uniqueCardIds.size) {
    throw new Error('Duplicate cardId found in items')
  }

  const itemsWithCards = []
  for (let item of items) {
    const card = await this.broker.call('card.get', { id: item.cardId })

    if (!card) {
      throw new Error(`Card with ID ${item.cardId} not found`)
    }
    if (card.available < item.quantity) {
      throw new Error(`Card with ID ${item.cardId} not enough quantity`)
    }

    const available = card.available - item.quantity
    await this.broker.call('card.update', {
      id: card._id,
      available,
    })

    let cardDiscount = 0
    let cardPrice = 0

    if (affiliateGroup) {
      const affiliateItem = affiliateGroup.items.find(i => i.card._id.toString() === card._id.toString())
      
      if (affiliateItem) {
        cardDiscount = affiliateItem.discountRate
        cardPrice = (card.price - (card.price * cardDiscount) / 100) * item.quantity
      } else {
        cardPrice = card.price * item.quantity
      }
    } else {
      cardPrice = card.price * item.quantity
    }

    itemsWithCards.push({
      card: card,
      quantity: item.quantity,
      discountRate: cardDiscount,
      price: cardPrice,
    })
  }

  const totalPrice = itemsWithCards.reduce((total, item) => total + item.price, 0)

  const order = {
    phone,
    email,
    items: itemsWithCards,
    affiliateCode: affiliateCode ? affiliateCode : null,
    affiliateGroup: affiliateCode ? affiliateGroup : null,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    totalPrice,
  }
  const createdOrder = await this.adapter.insert(order)
  return createdOrder
}
