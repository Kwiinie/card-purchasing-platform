import getRedisClient from '../../utils/redis-client.util.js'
import { ObjectId } from 'mongodb'

export default async function activate(ctx) {
  const userId = ctx.meta.user.id
  const { otp } = ctx.params
  const client = await getRedisClient()

  const user = await this.adapter.findOne({ _id: ObjectId.createFromHexString(userId) })
  console.log('user:', user)
  if (!user) {
    throw new Error('User not found')
  } else if (user.isActivated) {
    throw new Error('User already activated')
  }

  const userOtp = await client.get(`register:${userId}`)
  console.log('userOtp:', userOtp)
  if (!userOtp) {
    throw new Error('OTP not found or expired, please request again')
  } else if (userOtp !== otp) {
    throw new Error('Wrong OTP')
  } else {
    const updatedUser = await this.adapter.updateMany(
      { _id: ObjectId.createFromHexString(userId) },
      { $set: { isActivated: true } },
    )
    console.log('updatedUser:', updatedUser)
    await client.del(`register:${userId}`)
    return { message: 'User activated successfully' }
  }
}
