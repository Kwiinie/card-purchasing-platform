'use strict'
import register from '../../handlers/users/register.handler.js'
import dbMixin from '../../mixins/db.mixin.js'
import jwt from 'jsonwebtoken'
import activate from '../../handlers/users/activate.handler.js'
import { TwilioMixin } from '../../mixins/twilio.mixin.js'
import resendOTP from '../../handlers/users/resend-otp.handle.js'
import activateAffiliate from '../../handlers/users/activate-affiliate.handler.js'
import login from '../../handlers/users/login.handler.js'

const UserService = {
  name: 'user',
  mixins: [dbMixin('users'), TwilioMixin],
  collection: 'users',

  settings: {
    jwtSecret: process.env.JWT_SECRET,
    fields: [
      'fullName',
      'role',
      'phone',
      'affiliateCode',
      'affiliateGroup',
      'email',
      'password',
      'isActivated',
      'isAffiliate',
      'totalCommission',
      'totalCommissionOrder',
      'telegramChatId',
      'createdAt',
      'updatedAt',
      '_id',
    ],
    entityValidator: {
      fullName: { type: 'string', required: true },
      role: { type: 'enum', values: ['end-user', 'admin'], required: true },
      phone: { type: 'string', required: true, pattern: /^0\d{9}$/ },
      email: {
        type: 'string',
        required: true,
        pattern: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
      },
      affiliateCode: { type: 'number', unique: true, optional: true },
      password: { type: 'string', optional: true },
      isActivated: { type: 'boolean', required: true },
      isAffiliate: { type: 'boolean', required: true },
      affiliateGroup: { type: 'object', optional: true },
      totalCommission: { type: 'number', positive: true, optional: true },
      totalCommissionOrder: { type: 'number', positive: true, optional: true },
      telegramChatId: { type: 'string', optional: true },
    },
  },

  methods: {
    generateJWT(user) {
      const today = new Date()
      const exp = new Date(today)
      exp.setDate(today.getDate() + 60) 

      return jwt.sign(
        {
          id: user._id,
          role: user.role,
          isActivated: user.isActivated,
          exp: Math.floor(exp.getTime() / 1000),
        },
        this.settings.jwtSecret,
      )
    },
  },

  actions: {
    register: {
      rest: 'POST /register',
      params: {
        fullName: { type: 'string', required: true },
        phone: { type: 'string', required: true, pattern: /^0\d{9}$/ },
        email: {
          type: 'string',
          required: true,
          pattern: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
        },
        option: { type: 'enum', values: ['phone', 'email'], required: true },
        password: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await register.call(this, ctx)
      },
    },
    activate: {
      rest: 'PATCH /activate',
      params: {
        otp: { type: 'string', required: true },
      },
      auth: 'not-activated',
      async handler(ctx) {
        return await activate.call(this, ctx)
      },
    },

    //this action for registed user didnt receive otp or otp expired
    resendOTP: {
      rest: 'POST /resend-otp',
      params: {
        option: { type: 'enum', values: ['phone', 'email'], required: true },
      },
      auth: 'not-activated',
      async handler(ctx) {
        return await resendOTP.call(this, ctx)
      },
    },

    activateAffiliate: {
      rest: 'PATCH /affiliate-status',
      auth: 'activated',
      role: 'end-user',

      async handler(ctx) {
        return await activateAffiliate.call(this, ctx)
      },
    },

    login: {
      rest: 'POST /login',
      params: {
        email: {
          type: 'string',
          required: true,
          pattern: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
        },
        password: { type: 'string', required: true },
      },
      async handler(ctx) {
        return await login.call(this, ctx)
      },
    },
  },
}

export default UserService
