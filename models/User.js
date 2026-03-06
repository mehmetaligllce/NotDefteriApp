import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})
export default mongoose.model('UserSchema',UserSchema);