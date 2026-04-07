import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';
import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes
export const getAllNotes = async (req, res, next) => {
  try {
    const { tag, search, page = 1, perPage = 10 } = req.query;

    const currentPage = parseInt(page, 10);
    const currentPerPage = parseInt(perPage, 10);

    const filter = { userId: req.user._id };

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
      Note.find(filter).skip(skip).limit(currentPerPage),
    ]);

    res.status(200).json({
      page: currentPage,
      perPage: currentPerPage,
      totalNotes,
      totalPages: Math.ceil(totalNotes / currentPerPage),
      notes,
    });
  } catch (err) {
    next(err);
  }
};

// GET /notes/:noteId
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw createHttpError(404, 'Note not found');
    }

    const note = await Note.findOne({
      _id: noteId,
      userId: req.user._id,
    });

    if (!note) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// POST /notes
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

// PATCH /notes/:noteId
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw createHttpError(404, 'Note not found');
    }

    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: noteId,
        userId: req.user._id,
      },
      req.body,
      { new: true }
    );

    if (!updatedNote) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    next(err);
  }
};

// DELETE /notes/:noteId
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw createHttpError(404, 'Note not found');
    }

    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });

    if (!deletedNote) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
