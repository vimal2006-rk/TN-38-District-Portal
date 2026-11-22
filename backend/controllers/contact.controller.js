const prisma = require('../config/database');

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await prisma.contactDetail.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contactDetail.findUnique({ where: { id: parseInt(id) } });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

const createContact = async (req, res, next) => {
  try {
    const { label, value, type, sortOrder } = req.body;
    const contact = await prisma.contactDetail.create({
      data: { label, value, type, sortOrder: sortOrder ? parseInt(sortOrder) : 0 },
    });
    return res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, value, type, sortOrder, isActive } = req.body;

    const contact = await prisma.contactDetail.update({
      where: { id: parseInt(id) },
      data: {
        label, value, type,
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
      },
    });
    return res.status(200).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.contactDetail.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllContacts, getContactById, createContact, updateContact, deleteContact };
