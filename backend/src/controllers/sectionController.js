const Section = require('../models/Section');
const { applySectionDiscounts } = require('../utils/discountHelper');

const getSections = async (req, res, next) => {
    try {
        const sections = await Section.find({})
            .populate('products')
            .populate('category')
            .sort({ order: 1 });

        // Đối với Admin, chúng ta thường muốn xem giá gốc, 
        // nhưng nếu API này dùng chung cho client thì cần cân nhắc.
        // Ở đây giả định getSections (không có filter active) có thể dùng cho Admin Dashboard.
        // Tuy nhiên, để an toàn cho hiển thị, tôi sẽ không áp dụng giảm giá ở đây 
        // trừ khi bạn muốn Admin cũng thấy giá đã giảm.
        res.json(sections);
    } catch (error) {
        next(error);
    }
};

const getActiveSections = async (req, res, next) => {
    try {
        const sections = await Section.find({ active: true })
            .populate('products')
            .populate('category')
            .sort({ order: 1 });
            
        // Áp dụng giảm giá cho từng sản phẩm trong mỗi section
        const processedSections = await Promise.all(sections.map(async (section) => {
            const sectionObj = section.toObject();
            if (sectionObj.products && sectionObj.products.length > 0) {
                // Chúng ta truyền isAdmin=false vì đây là trang client
                sectionObj.products = await applySectionDiscounts(sectionObj.products, false);
            }
            return sectionObj;
        }));

        res.json(processedSections);
    } catch (error) {
        next(error);
    }
};

const createSection = async (req, res, next) => {
    try {
        const { title, description, type, products, categoryId, order, layoutType, discountConfig, startDate, endDate } = req.body;
        const section = await Section.create({
            title,
            description,
            type,
            products,
            category: categoryId,
            order,
            layoutType,
            discountConfig,
            startDate,
            endDate
        });
        res.status(201).json(section);
    } catch (error) {
        next(error);
    }
};

const updateSection = async (req, res, next) => {
    try {
        const { title, description, type, products, categoryId, order, active, layoutType, discountConfig, startDate, endDate } = req.body;
        const section = await Section.findById(req.params.id);
        if (section) {
            if (title) section.title = title;
            if (description !== undefined) section.description = description;
            if (type) section.type = type;
            if (products) section.products = products;
            if (categoryId !== undefined) section.category = categoryId || null;
            if (order !== undefined) section.order = order;
            if (active !== undefined) section.active = active;
            if (layoutType) section.layoutType = layoutType;
            if (discountConfig) section.discountConfig = discountConfig;
            if (startDate) section.startDate = startDate;
            if (endDate) section.endDate = endDate;
            
            const updatedSection = await section.save();
            res.json(updatedSection);
        } else {
            res.status(404);
            throw new Error('Section không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const deleteSection = async (req, res, next) => {
    try {
        const section = await Section.findById(req.params.id);
        if (section) {
            await section.deleteOne();
            res.json({ message: 'Đã xóa section' });
        } else {
            res.status(404);
            throw new Error('Section không tồn tại');
        }
    } catch (error) {
        next(error);
    }
};

const reorderSections = async (req, res, next) => {
    try {
        const sectionIds = req.body; // Array of section ids in new order
        if (!Array.isArray(sectionIds)) {
            res.status(400);
            throw new Error('Cần có mảng ID');
        }
        // Update order for each section
        const updatePromises = sectionIds.map((id, index) =>
            Section.findByIdAndUpdate(id, { order: index }, { new: true })
        );
        await Promise.all(updatePromises);
        res.json({ message: 'Đã cập nhật thứ tự' });
    } catch (error) {
        next(error);
    }
};

const addProductToSection = async (req, res, next) => {
    try {
        const { id, productId } = req.params;
        const section = await Section.findById(id);
        if (!section) {
            res.status(404);
            throw new Error('Section không tồn tại');
        }
        if (!section.products.includes(productId)) {
            section.products.push(productId);
            await section.save();
        }
        const updatedSection = await Section.findById(id).populate('products').populate('category');
        const sectionObj = updatedSection.toObject();
        sectionObj.id = sectionObj._id;
        if (sectionObj.products) {
            sectionObj.products = sectionObj.products.map(p => ({ ...p, id: p._id }));
        }
        res.json(sectionObj);
    } catch (error) {
        next(error);
    }
};

const removeProductFromSection = async (req, res, next) => {
    try {
        const { id, productId } = req.params;
        const section = await Section.findById(id);
        if (!section) {
            res.status(404);
            throw new Error('Section không tồn tại');
        }
        section.products = section.products.filter(p => p.toString() !== productId);
        await section.save();
        const updatedSection = await Section.findById(id).populate('products').populate('category');
        const sectionObj = updatedSection.toObject();
        sectionObj.id = sectionObj._id;
        if (sectionObj.products) {
            sectionObj.products = sectionObj.products.map(p => ({ ...p, id: p._id }));
        }
        res.json(sectionObj);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSections,
    getActiveSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    addProductToSection,
    removeProductFromSection,
};
