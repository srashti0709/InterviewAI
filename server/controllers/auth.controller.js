import genToken from "../config/token.js"
import { authCookieOptions } from "../config/cookies.js"
import User from "../models/user.model.js"


export const googleAuth = async (req,res) => {
    try {
        const {name, email} = req.body
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                name,
                email
            })
        }
        let token = await genToken(user._id)
        res.cookie("token", token, authCookieOptions)
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({message:`Google auth error ${error}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        res.clearCookie("token", authCookieOptions)
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
        return res.status(500).json({message:`LogOut error ${error}`})

    }
    
}