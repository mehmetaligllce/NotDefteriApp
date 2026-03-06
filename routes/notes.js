import mongoose from 'mongoose'
import express from 'express'
import authMiddleware from '../middlewares/auth.js'
import NoteSchema from '../models/Note.js'
const router = express.Router();
// GET
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await NoteSchema.find({ user: req.session.userID }).sort({ _id: -1 }).lean();
        res.render('notes', { notes: notes })
    }
    catch (e) {
        console.log(e);

    }
})

router.get('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id
        await NoteSchema.findByIdAndDelete(id)
        res.redirect('/notes')
    }
    catch (e) {
        console.log(e)
    }
})

router.get('/edit/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const note = await NoteSchema.findById(id).lean();
        res.render('edit', { note: note })
    } catch (e) {
        console.log(e);
        res.redirect('/notes');
    }
})

// POST

router.post('/add-note', authMiddleware, async (req, res) => {
    try {
        await NoteSchema.create({
            title: req.body.title,
            content: req.body.content,
            user: req.session.userID
        })
        res.redirect('/notes')
    }
    catch (e) {
        console.log(e);
    }
})

router.post('/edit/:id', authMiddleware, async (req, res) => {

    try {
        const id = req.params.id
        await NoteSchema.findByIdAndUpdate(id, { title: req.body.title, content: req.body.content }).lean()
        res.redirect('/notes')
    }
    catch (e) {
        console.log(e);
    }
})




export default router;

