import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config(
    { quiet: true }
)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
    connectionTimeout: 5000,
    socketTimeout: 5000 
})


export const sendMail = async (userEmail, resetLink) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'Renv Studio - Şifre Sıfırlama Talebi',
            html: `
                <h3>Merhaba!</h3>
                <p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla:</p>
                <a href="${resetLink}"  class="mail-link">Şifremi Sıfırla</a>
                <p>Eğer bu talebi sen yapmadıysan bu e-postayı görmezden gelebilirsin.</p>
            `
        }

        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (e) {
        console.log("Mail Hatasi:", e);
        return false;
    }
}