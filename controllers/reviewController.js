import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Add product review
const addReview = async (req, res) => {
    try {
        const { userId, productId, rating, comment } = req.body;
        const user = await userModel.findById(userId);
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const review = {
            userId,
            name: user.name,
            rating: Number(rating),
            comment,
            date: Date.now()
        };

        product.reviews.push(review);

        // Update average rating
        const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
        product.rating = totalRating / product.reviews.length;

        await product.save();

        res.status(200).json({ success: true, message: "Review added successfully", product });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { addReview };
