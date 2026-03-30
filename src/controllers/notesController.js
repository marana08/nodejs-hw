import { TAGS } from '../constants/tags.js';
import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export async function getAllNotes(req, res) {
  const { tag, search, page = 1, perPage = 10 } = req.query;

  // приводимо до числа
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

  const totalNotes = await Note.countDocuments(filter);

  const skip = (currentPage - 1) * currentPerPage;

  const notes = await Note.find(filter)
    .skip(skip)
    .limit(currentPerPage);

  const totalPages = Math.ceil(totalNotes / currentPerPage);

  res.status(200).json({
    page: currentPage,
    perPage: currentPerPage,
    totalNotes,
    totalPages,
    notes,
  });
}

export async function getNoteById(req, res) {
  const noteId = req.params.noteId;
  const note = await Note.findById(noteId);
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json({ note });
}

export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json({ note });
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json({ note });
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
    returnDocument: 'after',
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json({ note });
};
