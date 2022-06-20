const express = require('express')
const {verifyTokenAccess, verifyTokenEmail} = require('../lib/verifyToken') 
const Router = express.Router()
const {authControllers} = require ('../controllers') 
const { login, keeplogin, changePassword, register, sendEmailVerified, accountVerified} = authControllers   
const {verifyLastToken} = require('../lib/verifyLastToken')



Router.post('/login', login) 
Router.get('/keepLogin',verifyTokenAccess,keeplogin)  
Router.put('/changePassword', verifyTokenAccess, changePassword)  
Router.post('/register', register) 
Router.get('/verified',verifyTokenEmail,verifyLastToken,accountVerified) 
Router.post('/sendemail-verified', sendEmailVerified) 



module.exports = Router
