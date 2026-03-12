const noteService = require("../services/noteService");

const createNote = async (req, res) => {
  try {
    const note = await noteService.createNote(req.user.userId, req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await noteService.getNotesByPaper(req.params.paperId, req.user.userId);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.user.userId, req.body.content);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    await noteService.deleteNote(req.params.id, req.user.userId);
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote
};
