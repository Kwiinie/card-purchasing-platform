import { ServiceBroker } from 'moleculer'
import config from './moleculer.config.js'
import TransactionService from './services/transactions/transaction.service.js'
import ApiService from './services/api.service.js'
import MomoService from './services/payments/momo.service.js'
import ZalopayService from './services/payments/zalopay.service.js'
import crypto from 'crypto'
import SupplierService from './services/suppliers/supplier.service.js'
import CardService from './services/cards/card.service.js'
import AffiliateGroupService from './services/affiliate-group/affiliate-group.service.js'
import OrderService from './services/orders/order.service.js'
import UserService from './services/users/user.service.js'
import MailerService from 'moleculer-mail'
import bcrypt from 'bcryptjs'
import TelegramService from './services/telegram.service.js'

const broker = new ServiceBroker({
  ...config,
})

broker.createService(TransactionService)
broker.createService(ApiService)
broker.createService(ZalopayService)
broker.createService(MomoService)
broker.createService(SupplierService)
broker.createService(CardService)
broker.createService(AffiliateGroupService)
broker.createService(OrderService)
broker.createService(UserService)
broker.createService(MailerService, {
  settings: {
    transport: {
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    },
  },
})
broker.createService(TelegramService)

broker.start().then(async () => {
  broker.repl()

  const adminExist = await broker.call('user.find', {
    query: { role: 'admin' },
  })

  if (adminExist.length === 0) {
    await broker
      .call('user.create', {
        email: 'admin@gmail.com',
        phone: '0123456789',
        fullName: 'Admin',
        password: await bcrypt.hash('123456', 10),
        role: 'admin',
        isActivated: true,
        isAffiliate: false,
      })
      .then(res => {
        console.log('admin account successfully created:', res)
      })
  }

  console.log('This project is running on http://localhost:' + process.env.PORT)
})
