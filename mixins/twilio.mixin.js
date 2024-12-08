import twilio from 'twilio'

export const TwilioMixin = {
  methods: {
    async sendSms(to, body) {
      const accountSid = process.env.TWILIO_SID
      const authToken = process.env.TWILIO_TOKEN
      const from = process.env.TWILIO_FROM
      const client = twilio(accountSid, authToken)

      try {
        const message = await client.messages.create({
          to,
          from,
          body,
        })

        return message
      } catch (error) {
        throw new Error('Failed to send SMS: ' + error.message)
      }
    },
  },
}
