import getRedisClient from '../../utils/redis-client.util.js'

export default async function findOrders(ctx) {
  const { contact, otp } = ctx.params
  const phoneRegex = /^0\d{9}$/
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  const client = await getRedisClient()
  const userOTP = await client.get(`requestOrder:${contact}`)

  if (contact.match(phoneRegex)) {
    if (userOTP === otp) {
      await client.del(`requestOrder:${contact}`)
      const orders = await this.broker.call('order.find', { query: { phone: contact } })
      if (orders.length > 0) {
        const response = orders.map(order => {
          const { affiliateGroup, ...rest } = order
          return rest
        })
        return response
      } else {
        throw new Error('No orders found!')
      }
    } else {
      throw new Error('OTP not found or expired, please request again')
    }
  } else if (contact.match(emailRegex)) {
    if (userOTP === otp) {
      await client.del(`requestOrder:${contact}`)
      const orders = await this.broker.call('order.find', { query: { email: contact } })
      if (orders.length > 0) {
        const response = orders.map(order => {
          const { affiliateGroup, ...rest } = order
          return rest
        })
        return response
      } else {
        throw new Error('No orders found!')
      }
    } else {
      throw new Error('OTP not found or expired, please request again')
    }
  } else {
    throw new Error('Invalid email address or phone number!')
  }
}
