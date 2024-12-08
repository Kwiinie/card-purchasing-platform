import bcrypt from 'bcryptjs'

export default async function login(ctx) {
  const { email, password } = ctx.params
  const user = await this.adapter.findOne({ email })

  if (!user) {
    throw new Error('Invalid credentials')
  }
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw new Error('Invalid credentials')
  }

  const token = this.generateJWT(user)
  
  return {
    message: 'Login successful',
    token: token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  }
}
