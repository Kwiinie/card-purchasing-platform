import bcrypt from 'bcryptjs'
import generateOTP from '../../utils/otp.util.js'
import getRedisClient from '../../utils/redis-client.util.js'
import { ObjectId } from 'mongodb'

export default async function resendOTP(ctx) {
  const { option } = ctx.params
  const userId = ctx.meta.user.id
  const user = await this.adapter.findOne({ _id: ObjectId.createFromHexString(userId) })
  const client = await getRedisClient()

  if (!user) {
    throw new Error('User not found')
  }
  if (user.isActivated) {
    throw new Error('User already activated')
  }

  const otp = generateOTP()
  if (option === 'phone') {
    return {
      message:
        'Please view our Telegram bot to get your OTP for account activation: https://t.me/CardPurchasingPlatform_bot',
    }
  } else if (option === 'email') {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Your OTP for Account Activation for Card Purchasing Platform',
      html: `
     <p>Hello ${user.fullName},</p>
     <p>Your one-time verification code (OTP) for the Card Purchasing Platform is:</p>
     <h3>${otp}</h3>
     <p>This code is valid for 1 minute only. Please use it to verify your account.</p>
     <p>If you did not request this verification, please ignore this email.</p>
     <p>Best regards,</p>
 `,
    }

    try {
      const info = await this.broker.call('mail.send', mailOptions)
      console.log('Email sent:', info)
    } catch (error) {
      throw new Error('Failed to send OTP email: ' + error.message)
    }
  }
  await client.set(`register:${user._id}`, otp)
  await client.expire(`register:${user._id}`, 60)
  return {
    message: 'OTP sent successfully',
  }
}
