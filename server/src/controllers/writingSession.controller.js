import noteModel from '../models/notes.model.js';
import writingSessionModel from '../models/writingSession.model.js';

export const createWritingSession = async ({ userId, content = '' }) => {
    const session = await writingSessionModel.create({
        author: userId,
        startedAt: new Date(),
        status: "active",
        content,
    });

    return session;
};

export const endWritingSessionById = async (req, res) => {
    const userId = req.userId;
    const sessionId = req.params.sessionId;

    const {
        content,
        totalTypedChars,
        totalPastedChars,
        pasteRatio
    } = req.body;

    try {
        const session = await writingSessionModel.findOneAndUpdate(
            {
                _id: sessionId,
                author: userId
            },
            {
                content,
                totalTypedChars,
                totalPastedChars,
                pasteRatio,
                status: 'ended',
                endedAt: new Date()
            },
            { returnDocument: 'after' }
        );

        if (!session) {
            return res.status(404).json({ error: 'Writing session not found' });
        }

        const note = await noteModel.findOneAndUpdate(
            {
                author: userId,
                // search the note by sessionId in the sessions array
                sessions: sessionId
            },
            { content },
            { returnDocument: 'after' }
        );

        if (!note) return res.status(404).json({ error: "Note not found for this session" });

        return res.status(200).json({
            message: "Writing session ended and note saved successfully",
            note: { id: note._id, title: note.title, content: note.content },
            session: { id: session._id, status: session.status, endedAt: session.endedAt },
        });
    } catch (error) {
        console.error('Error in endWritingSessionById:', error);
        res.status(500).json({ error: error.message });
    }
};