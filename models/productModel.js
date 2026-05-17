import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  subCategory: {
    type: String,
    required: true,
    index: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
  bestSeller: {
    type: Boolean,
    index: true,
  },
  date: {
    type: Number,
    required: true,
    index: true,
  },
  reviews: [
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      date: { type: Number, default: Date.now() },
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
