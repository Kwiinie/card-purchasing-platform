import { ObjectId } from 'mongodb'

export default async function updateQuantity(ctx) {
  const { cardId, quantity } = ctx.params
  const card = await this.adapter.findOne({ _id: ObjectId.createFromHexString(cardId) })
  if (!card) {
    throw new Error('Card not found')
  }
  const available = card.available + quantity
  const updatedCard = await this.adapter.updateById(cardId, { $set: { available: available } })
  return updatedCard
}
