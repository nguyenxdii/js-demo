const Section = require('../models/Section');

/**
 * Helper to apply dynamic section discounts to products.
 * Finds the highest discount among all active sections for each product.
 */
const applySectionDiscounts = async (products, isAdmin = false) => {
    if (isAdmin || !products) return products;

    try {
        // Relaxing search to ensure we find all potential discounts
        const activeSections = await Section.find({ 
            // In case "active" is boolean OR undefined (defaulting to true)
            $or: [{ active: true }, { active: { $exists: false } }],
            'discountConfig.active': true,
            'discountConfig.discountPercentage': { $gt: 0 }
        });

        if (!activeSections || activeSections.length === 0) {
            return products;
        }

        const isArray = Array.isArray(products);
        const productList = isArray ? products : [products];

        const updatedProducts = productList.map(product => {
            if (!product) return product;
            
            let maxDiscount = 0;
            // Handle both Mongoose document and plain object
            const productId = product._id || product.id;
            if (!productId) return product;
            
            const productIdStr = productId.toString();

            // Find all sections this product belongs to and pick highest discount
            activeSections.forEach(section => {
                if (section.products && section.products.length > 0) {
                    const hasProduct = section.products.some(id => {
                        const sid = (id?._id || id)?.toString();
                        return sid === productIdStr;
                    });
                    
                    if (hasProduct) {
                        const currentPct = Number(section.discountConfig.discountPercentage) || 0;
                        if (currentPct > maxDiscount) {
                            maxDiscount = currentPct;
                        }
                    }
                }
            });

            if (maxDiscount > 0) {
                // Ensure we don't mutate original product if it's a doc
                const p = product.toObject ? product.toObject() : JSON.parse(JSON.stringify(product));
                
                // If price in DB is somehow a string
                const originalPrice = Number(p.price) || 0;
                p.oldPrice = Number(p.oldPrice) || originalPrice;
                p.price = originalPrice * (1 - maxDiscount / 100);
                p._sectionDiscount = maxDiscount;
                return p;
            }
            return product;
        });

        return isArray ? updatedProducts : updatedProducts[0];
    } catch (error) {
        console.error('Error applying section discounts:', error);
        return products;
    }
};

module.exports = {
    applySectionDiscounts
};
