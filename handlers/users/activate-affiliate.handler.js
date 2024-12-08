import { ObjectId } from 'mongodb'
import generateAffiliateCode from '../../utils/affiliateCode.util.js'

export default async function activateAffiliate(ctx) {
  const userId = ctx.meta.user.id
  const user = await this.adapter.findOne({ _id: ObjectId.createFromHexString(userId) })
  if (!user) {
    throw new Error('User not found')
  } else if (user.affiliateCode) {
    user.isAffiliate = !user.isAffiliate
    await this.adapter.updateById(userId, {
      $set: {
        isAffiliate: user.isAffiliate,
        updatedAt: new Date(),
      },
    })
    return { message: 'Change affiliate status successfully' }
  }

  let code = generateAffiliateCode()
  let existingCode = await this.adapter.findOne({ affiliateCode: code })
  while (existingCode) {
    code = generateAffiliateCode()
    existingCode = await this.adapter.findOne({ affiliateCode: code })
  }
  const affiliateGroups = await this.broker.call('affiliateGroup.find', {
    query: { name: 'VIP1' },
  })
  const affiliateGroup = affiliateGroups[0]
  if (!affiliateGroup) {
    throw new Error('Affiliate group not found')
  }

  await this.adapter.updateById(userId, {
    $set: {
      affiliateCode: code,
      isAffiliate: true,
      affiliateGroup: affiliateGroup,
      totalCommission: 0,
      totalCommissionOrder: 0,
    },
  })

  return { message: 'User become affiliate successfully' }
}
