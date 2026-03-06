import express from 'express';
import mongoose from 'mongoose'
import User from '../models/User.js'
import bcrypt from '../modules/bcrypt.js'
import RouterNotes from '../routes/notes.js'
import { sendMail } from '../modules/mailer.js'
import crypto from 'crypto'

const router = express.Router();

//GET
router.get('/login', (req, res) => {
    res.render('login', {
        error: req.flash('error')
    })
})
router.get('/register', (req, res) => {
    res.render('register', {
        error: req.flash('error')
    })
})


router.get('/logout', async (req, res) => {

    req.session.destroy();
    res.redirect('/login')



})

router.get('/reset-password', (req, res) => {
    res.render('reset', { error: req.flash('error'), success: req.flash('success') })
})

router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.');
            return res.redirect('/reset-password');
        }

        res.render('newpassword', { token: req.params.token, error: req.flash('error') });
    } catch (e) {
        res.redirect('/login');
    }
})



//POST
router.post('/register', async (req, res) => {
    try {

        if (req.body.password.length < 8) {
            req.flash('error', 'Şifre en az 8 karakter olmalıdır.')
            return res.redirect('/register')
        }

        const isUsername = await User.findOne({ username: req.body.username })

        if (isUsername) {
            req.flash('error', 'Kullanıcı adı zaten mevcut')
            return res.redirect('/register')
        }
        const isEmail = await User.findOne({ email: req.body.email })
        if (isEmail) {
            req.flash('error', 'E-posta zaten mevcut')
            return res.redirect('/register')
        }

        await User.create({
            username: req.body.username,
            email: req.body.email,
            passwordHash: await bcrypt.hashPassword(req.body.password)
        })
        res.redirect('/login')
    }
    catch (err) {
        console.log(err)
    }
})

router.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;


        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            req.flash('error', 'Kullanıcı adı bulunamadı!')
            return res.redirect('/login')
        }
        else {
            if (await bcrypt.comparePassword(password, user.passwordHash)) {
                req.session.userID = user._id;
                res.redirect('/notes')
            }
            else {
                req.flash('error', 'Kullanıcı adı veya şifre yanlış')

                res.redirect('/login')
            }
        }
    }
    catch (e) {
        console.log(e)
    }
})


router.post('/send-mail', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'Bu e-posta adresine ait bir kullanıcı bulunamadı.');
            return res.redirect('/reset-password');
        }

        const token = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `https://${req.headers.host}/reset-password/${token}`;
        const isSent = await sendMail(user.email, resetLink);

        if (isSent) {
            req.flash('success', 'Şifre sıfırlama e-postası gönderildi!');
            res.redirect('/login');
        } else {
            req.flash('error', 'E-posta gönderilemedi. Lütfen sistem değişkenlerini kontrol edin.');
            res.redirect('/reset-password');
        }

    } catch (e) {
        req.flash('error', 'Bir sunucu hatası oluştu!');
        res.redirect('/reset-password');
    }
})

router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.');
            return res.redirect('/reset-password');
        }
        user.passwordHash = await bcrypt.hashPassword(req.body.password);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.redirect('/login');
    }
    catch (e) {
        console.log(e)
        res.redirect('/login')
    }
})





router.use('/notes', RouterNotes)

export default router;
