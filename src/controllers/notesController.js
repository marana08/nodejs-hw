import { TAGS } from '../constants/tags.js';
import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes
export async function getAllNotes(req, res) {
  const { tag, search, page = 1, perPage = 10 } = req.query;

  const currentPage = Number(page);
  const currentPerPage = Number(perPage);

  const filter = {};

  if (tag) {
    if (!TAGS.includes(tag)) {
      throw createHttpError(400, 'Invalid tag');
    }
    filter.tag = tag;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (currentPage - 1) * currentPerPage;

  const [totalNotes, notes] = await Promise.all([
    Note.countDocuments(filter),
    Note.find(filter)
      .skip(skip)
      .limit(currentPerPage),
  ]);

  const totalPages = Math.ceil(totalNotes / currentPerPage);

  res.status(200).json({
    page: currentPage,
    perPage: currentPerPage,
    totalNotes,
    totalPages,
    notes,
  });
}

// GET /notes/:noteId
export async function getNoteById(req, res) {
  const { noteId } = req.params;

  const note = await Note.findById(noteId);

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json({ note });
}

// POST /notes
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json({ note });
};

// DELETE /notes/:noteId
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({ _id: noteId });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json({ note });
};

// PATCH /notes/:noteId
export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    { _id: noteId },
    req.body,
    { returnDocument: 'after' }
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json({ note });
};
