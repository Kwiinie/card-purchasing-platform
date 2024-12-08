export default async function createCard(ctx) {
  const { type, supplierId, faceValue, price, available } = ctx.params
  const supplier = await this.broker.call('supplier.get', { id: supplierId })
  if (!supplier) {
    throw new Error('Supplier not found')
  }
  const card = {
    type,
    supplier,
    faceValue,
    price,
    available,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const createdCard = await this.adapter.insert(card)
  return createdCard
}
