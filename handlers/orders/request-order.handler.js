import generateOTP from '../../utils/otp.util.js'
import getRedisClient from '../../utils/redis-client.util.js'

export default async function requestOrder(ctx) {
  const contact = ctx.params.contact
  const phoneRegex = /^0\d{9}$/
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  const otp = generateOTP()
  const client = await getRedisClient()

  if (contact.match(phoneRegex)) {
    return {
      message:
        'Please view our Telegram bot to get your OTP for view all your orders: https://t.me/CardPurchasingPlatform_bot',
    }
  } else if (contact.match(emailRegex)) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: contact,
      subject: 'Your OTP for Orders Request for Card Purchasing Platform',
      html: `
         <p>Hello customer,</p>
         <p>Your one-time verification code (OTP) for the Card Purchasing Platform is:</p>
         <h3>${otp}</h3>
         <p>This code is valid for 1 minute only. Please use it to view all your orders.</p>
         <p>If you did not request this verification, please ignore this email.</p>
         <p>Best regards,</p>
     `,
    }

    try {
      await this.broker.call('mail.send', mailOptions)
    } catch (error) {
      throw new Error('Failed to send OTP email: ' + error.message)
    }
    await client.set(`requestOrder:${contact}`, otp)
    await client.expire(`requestOrder:${contact}`, 60)
    return { message: 'OTP sent to your email successfully' }
  } else {
    throw new Error('Invalid email address or phone number!')
  }
}
