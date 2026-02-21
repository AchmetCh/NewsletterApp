const Newsletter = require('../models/Newsletter');

// @desc    Get all newsletters
// @route   GET /api/newsletters
// @access  Private
const getNewsletters = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
    
    res.json(newsletters);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single newsletter by ID
// @route   GET /api/newsletters/:id
// @access  Private
const getNewsletterById = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    res.json(newsletter);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new newsletter
// @route   POST /api/newsletters
// @access  Private
const createNewsletter = async (req, res, next) => {
  try {
    const { title, month, year, designJson, html } = req.body;

    // Validation
    if (!title || !month || !year) {
      return res.status(400).json({ 
        message: 'Title, month, and year are required' 
      });
    }

    const newsletter = await Newsletter.create({
      title,
      month,
      year,
      designJson: designJson || {},
      html: html || '',
      createdBy: req.user._id
    });

    const populatedNewsletter = await Newsletter.findById(newsletter._id)
      .populate('createdBy', 'email');

    res.status(201).json({
      message: 'Newsletter created successfully',
      newsletter: populatedNewsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a newsletter
// @route   PUT /api/newsletters/:id
// @access  Private
const updateNewsletter = async (req, res, next) => {
  try {
    const { title, month, year, designJson, html } = req.body;

    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    // Update fields
    if (title !== undefined) newsletter.title = title;
    if (month !== undefined) newsletter.month = month;
    if (year !== undefined) newsletter.year = year;
    if (designJson !== undefined) newsletter.designJson = designJson;
    if (html !== undefined) newsletter.html = html;

    await newsletter.save();

    const updatedNewsletter = await Newsletter.findById(newsletter._id)
      .populate('createdBy', 'email');

    res.json({
      message: 'Newsletter updated successfully',
      newsletter: updatedNewsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a newsletter
// @route   DELETE /api/newsletters/:id
// @access  Private
const deleteNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    await Newsletter.findByIdAndDelete(req.params.id);

    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate a newsletter
// @route   POST /api/newsletters/:id/duplicate
// @access  Private
const duplicateNewsletter = async (req, res, next) => {
  try {
    const originalNewsletter = await Newsletter.findById(req.params.id);

    if (!originalNewsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    // Create duplicate with "Copy of" prefix
    const duplicatedNewsletter = await Newsletter.create({
      title: `Copy of ${originalNewsletter.month}`,
      month: originalNewsletter.month,
      year: originalNewsletter.year,
      designJson: originalNewsletter.designJson,
      html: originalNewsletter.html,
      createdBy: req.user._id
    });

    const populatedNewsletter = await Newsletter.findById(duplicatedNewsletter._id)
      .populate('createdBy', 'email');

    res.status(201).json({
      message: 'Newsletter duplicated successfully',
      newsletter: populatedNewsletter
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  duplicateNewsletter
};
