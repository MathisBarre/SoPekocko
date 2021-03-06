import { Response, Request, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model'

export async function signup (req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email: string = req.body.email
    const password: string = req.body.password
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ email, password: hashedPassword })
    res.json(newUser)
  } catch (error) {
    next(error)
  }
}

export async function login (req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const emailInRequest: string = req.body.email

    const userInDB = await User.findOne({ email: emailInRequest })

    if (userInDB === null || userInDB.password === null) {
      res.status(401).json({
        message: 'Access denied : no account is linked to this email address'
      })
      return
    }

    const passwordInRequest: string = req.body.password
    const hashedPasswordInDB = userInDB.password
    const thePasswordsMatch = await bcrypt.compare(passwordInRequest, hashedPasswordInDB)

    if (thePasswordsMatch) {
      const jwtToken = jwt.sign(
        { userId: userInDB._id },
        process.env.JWT_PRIVATE_KEY ?? '987default68468secret6487key159',
        { expiresIn: '4h' }
      )

      res.json({
        userId: userInDB._id,
        token: jwtToken
      })
    } else {
      res.status(401).json({
        message: 'Access denied : bad password'
      })
    }
  } catch (error) {
    next(error)
  }
}
