import { Request, Response } from "express";
import Book from "../models/book";
import cloudinary from "cloudinary";

const createMyBook = async (req: Request, res: Response) => {
  try {
    const { email } = req.user;
    const { name } = req.user;

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const book = new Book(req.body);
    book.imageUrl = imageUrl;
    book.author = name;
    book.authorid = email;
    await book.save();
    res.status(201).json({ book: book.toObject() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

const getAllbook = async (req: Request, res: Response) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};
const getAdminbook = async (req: Request, res: Response) => {
  try {
    const { email } = req.user;
    const books = await Book.find({ authorid: email });
    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};
const getviewbook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const updateMybook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const book = await Book.findById(id);
    console.log(req.body);
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    book.title = req.body.title;
    book.genre = req.body.genre;
    book.price = req.body.price;
    book.publish = req.body.publish;
    book.description = req.body.description;
    book.tag = req.body.tag;

    if (req.file) {
      book.imageUrl = await uploadImage(req.file as Express.Multer.File);
    } else {
      book.imageUrl = book.imageUrl;
    }
    await book.save();
    res.status(200).send(book);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const searchbook = async (req: Request, res: Response) => {
  try {
    const title = req.params.title || "";
    const searchQuery = (req.query.searchQuery as string) || "";
    const sortOption = req.query.sortOption as string;
    const page = parseInt(req.query.page as string) || 1;
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;
    const rating = parseInt(req.query.rating as string) || null;

    const query: any = {};

    // Search by title
    if (title) {
      query["title"] = new RegExp(title, "i");
    }

    // Search by searchQuery
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [{ title: searchRegex }, { tag: { $in: [searchRegex] } }];
    }

    // Filter by price
    query["price"] = { $gte: minPrice, $lte: maxPrice };

    // Filter by rating
    if (rating) {
      query["rating"] = { $gte: rating };
    }

    // Sorting logic
    let sortCriteria: any = {};
    switch (sortOption) {
      case "price_asc":
        sortCriteria = { price: 1 }; // Ascending by price
        break;
      case "price_desc":
        sortCriteria = { price: -1 }; // Descending by price
        break;
      case "publish_asc":
        sortCriteria = { publish: 1 }; // Ascending by publishDate
        break;
      case "publish_desc":
        sortCriteria = { publish: -1 }; // Descending by publishDate
        break;
      case "rating_asc":
        sortCriteria = { rating: 1 }; // Ascending by rating
        break;
      case "rating_desc":
        sortCriteria = { rating: -1 }; // Descending by rating
        break;
      default:
        sortCriteria = { publishDate: -1 }; // Default to sorting by publishDate descending
    }

    // Pagination and fetching books
    const pageSize = 3;
    const skip = (page - 1) * pageSize;
    const books = await Book.find(query)
      .sort(sortCriteria) // Apply sorting
      .skip(skip)
      .limit(pageSize);

    const total = await Book.countDocuments(query);

    // Send the response
    const response = {
      data: books,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const searchadminbook = async (req: Request, res: Response) => {
  try {
    const { email } = req.user;
    const title = req.params.title || "";
    const searchQuery = (req.query.searchQuery as string) || "";
    const sortOption = req.query.sortOption as string;
    const page = parseInt(req.query.page as string) || 1;
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;
    const rating = parseInt(req.query.rating as string) || null;

    const query: any = { authorid: email };

    // Search by title
    if (title) {
      query["title"] = new RegExp(title, "i");
    }

    // Search by searchQuery
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [{ title: searchRegex }, { tag: { $in: [searchRegex] } }];
    }

    // Filter by price
    query["price"] = { $gte: minPrice, $lte: maxPrice };

    // Filter by rating
    if (rating) {
      query["rating"] = { $gte: rating };
    }

    // Sorting logic
    let sortCriteria: any = {};
    switch (sortOption) {
      case "price_asc":
        sortCriteria = { price: 1 }; // Ascending by price
        break;
      case "price_desc":
        sortCriteria = { price: -1 }; // Descending by price
        break;
      case "publish_asc":
        sortCriteria = { publish: 1 }; // Ascending by publishDate
        break;
      case "publish_desc":
        sortCriteria = { publish: -1 }; // Descending by publishDate
        break;
      case "rating_asc":
        sortCriteria = { rating: 1 }; // Ascending by rating
        break;
      case "rating_desc":
        sortCriteria = { rating: -1 }; // Descending by rating
        break;
      default:
        sortCriteria = { publishDate: -1 }; // Default to sorting by publishDate descending
    }

    // Pagination and fetching books
    const pageSize = 3;
    const skip = (page - 1) * pageSize;
    const books = await Book.find(query)
      .sort(sortCriteria) // Apply sorting
      .skip(skip)
      .limit(pageSize);

    const total = await Book.countDocuments(query);

    // Send the response
    const response = {
      data: books,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export default {
  createMyBook,
  getAllbook,
  updateMybook,
  getviewbook,
  searchbook,
  getAdminbook,
  searchadminbook,
};
