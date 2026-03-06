import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({

    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, default: `0${new Date().getDate()}. ${new Date().getMonth()}. ${new Date().getFullYear()}` }
});
export default mongoose.model('Note', NoteSchema)