import bcrypt from 'bcryptjs'
import generateOTP from '../../utils/otp.util.js'
import getRedisClient from '../../utils/redis-client.util.js'
import UserService from '../../services/users/user.service.js'

export default async function register(ctx) {
  const { fullName, phone, email, password, option } = ctx.params
  console.log('fullName', fullName)
  const checkUserPhone = await this.adapter.findOne({ phone: phone })
  const checkUserEmail = await this.adapter.findOne({ email: email })
  const client = await getRedisClient()

  if (checkUserPhone) {
    throw new Error('User with this phone number already exists!')
  } else if (checkUserEmail) {
    throw new Error('User with this email already exists!')
  } else {
    const hash = await bcrypt.hash(password, 10)
    const user = {
      fullName: fullName,
      phone: phone,
      email: email,
      password: hash,
      role: 'end-user',
      isActivated: false,
      isAffiliate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.adapter.insert(user)

    const otp = generateOTP()

    if (option === 'phone') {
      return {
        message:
          'Please view our Telegram bot to get your OTP for account activation: https://t.me/CardPurchasingPlatform_bot',
      }
    } else if (option === 'email') {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your OTP for Account Activation for Card Purchasing Platform',
        html: `
        <p>Hello ${fullName},</p>
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

        console.log('OTP email sent successfully')
      } catch (error) {
        throw new Error('Failed to send OTP email: ' + error.message)
      }
    }

    const token = this.generateJWT(user)

    await client.set(`register:${user._id}`, otp)
    await client.expire(`register:${user._id}`, 60)
    return {
      token: token,
      user: user,
    }
  }
}
