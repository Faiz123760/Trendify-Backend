import userModel from '../models/userModel.js';

// Toggle product in wishlist
const toggleWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const userData = await userModel.findById(userId);
        let wishlist = userData.wishlist || [];

        if (wishlist.includes(productId)) {
            wishlist = wishlist.filter(id => id !== productId);
            await userModel.findByIdAndUpdate(userId, { wishlist });
            res.status(200).json({ success: true, message: "Removed from wishlist", wishlist });
        } else {
            wishlist.push(productId);
            await userModel.findByIdAndUpdate(userId, { wishlist });
            res.status(200).json({ success: true, message: "Added to wishlist", wishlist });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get user wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId);
        res.status(200).json({ success: true, wishlist: userData.wishlist || [] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { toggleWishlist, getWishlist };
