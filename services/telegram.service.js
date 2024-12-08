import TelegramBot from 'node-telegram-bot-api'
import dbMixin from '../mixins/db.mixin.js'
import generateOTP from '../utils/otp.util.js'
import getRedisClient from '../utils/redis-client.util.js'

const TelegramService = {
  name: 'telegram',
  settings: {
    token: process.env.TELEGRAM_TOKEN,
  },
  mixins: [dbMixin('telegramContacts')],
  created() {
    this.bot = new TelegramBot(this.settings.token, { polling: true })
  },
  started() {
    this.bot.on('message', async msg => {
      const chatId = msg.chat.id
      const text = typeof msg.text === 'string' ? msg.text.trim() : '';
      const client = await getRedisClient()
      const otp = generateOTP()

      if (!this.userStates) this.userStates = {}

      if (text === '/start') {
        this.userStates[chatId] = { state: 'awaiting_phone' }
        await this.bot.sendMessage(
          chatId,
          'Hello! Welcome to Card Purchasing Platform. Please enter your phone number.',
        )
        return
      }

      if (text === "/end") {
         delete this.userStates[chatId]; 
         await this.bot.sendMessage(chatId, "The session has been ended. Thank you for using the platform! Type /start to begin again.");
         return;
     }

      if (this.userStates[chatId]?.state === 'awaiting_phone') {
        const phoneRegex = /^0\d{9}$/
        if (phoneRegex.test(text)) {
          this.userStates[chatId] = { state: 'completed', phone: text }

          const users = await this.broker.call('user.find', {
            query: { phone: text, role: 'end-user' },
          })

          const user = users[0]
          if (user) {
            await this.bot.sendMessage(
              chatId,
              'Your phone number has been linked to your Telegram account successfully!',
            )
            await this.bot.sendMessage(
              chatId,
              'Type /viewOrders to receive OTP for viewing your orders or /activate to receive OTP for activating your account or /end to end the session.',
            )
            return
          } else {
            delete this.userStates[chatId]
            await this.bot.sendMessage(
              chatId,
              'User not found. Please register to our platform first.',
            )
            return
          }
        } else {
          await this.bot.sendMessage(
            chatId,
            'Invalid phone number. Please enter a valid phone number (10 digits starting with 0).',
          )
          return
        }
      }

      if (this.userStates[chatId]?.state === 'completed') {
        const phone = this.userStates[chatId]?.phone
        const users = await this.broker.call('user.find', {
          query: { phone, role: 'end-user' },
        })

        const user = users[0]
        if (user) {
          if (text === '/viewOrders') {
            await this.bot.sendMessage(
              chatId,
              `Your OTP for viewing orders is: ${otp}. This code is valid for 1 minute only. Please use it to verify your request.`,
            )
            await client.set(`requestOrder:${phone}`, otp)
            await client.expire(`requestOrder:${phone}`, 60)
            return
          }

          if (text === '/activate') {
            await this.bot.sendMessage(
              chatId,
              `Your activation code for Card Purchasing Platform is: ${otp}. This code is valid for 1 minute only. Please use it to verify your account.`,
            )
            await client.set(`register:${user._id}`, otp)
            await client.expire(`register:${user._id}`, 60)
            return
          }
        }

        await this.bot.sendMessage(chatId, 'Invalid command. Please use /viewOrders or /activate.')
        return
      }

      await this.bot.sendMessage(chatId, "I didn't understand that. Please type /start to begin.")
    })
  },
}

export default TelegramService
