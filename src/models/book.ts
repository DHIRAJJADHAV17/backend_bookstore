import mongoose from "mongoose";

const tagItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const bookSchema = new mongoose.Schema({
  author: { type: String, required: true },
  authorid: { type: String, required: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  tag: [tagItemSchema],
  price: { type: Number, required: true },
  publish: { type: Date, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: Boolean, default: false },
});

const Book = mongoose.model("book", bookSchema);

export default Book;
