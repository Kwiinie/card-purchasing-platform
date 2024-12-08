export default async function createAffiliateGroup(ctx) {
  const { name, items } = ctx.params

  const existingGroup = await this.adapter.findOne({ name })
  if (existingGroup) {
    throw new Error(`Affiliate group name "${name}" already exists`)
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

    itemsWithCards.push({
      card: card,
      commissionRate: item.commissionRate,
      discountRate: item.discountRate,
    })
  }

  const affiliateGroup = {
    name,
    items: itemsWithCards,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createdAffiliateGroup = await this.adapter.insert(affiliateGroup)

  return createdAffiliateGroup
}
