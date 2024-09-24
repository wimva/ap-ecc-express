import express from 'express';
const router = express.Router();

// GET: Retrieve all messages
router.get('/', (req, res) => {
  res.json({ message: 'Messages retrieved successfully!' });
});

// POST: Add a new message
router.post('/', (req, res) => {
  const newMessage = req.body;
  console.log(newMessage);
  res.status(201).json({ message: 'Message added successfully!', messageData: newMessage });
});

// PUT: Update an existing message
router.put('/:id', (req, res) => {
  const { id } = req.params; // == req.params.id;
  const updatedMessage = req.body;
  if (id) {
    res.json({ message: 'Message updated successfully!', messageData: updatedMessage });
  } else {
    res.status(404).json({ message: 'Message not found' });
  }
});

// DELETE: Remove a message by ID
router.delete('/', (req, res) => {
  const { id } = req.query; // == req.query.id;
  if (id) {
    res.json({ message: 'Message deleted successfully!' });
  } else {
    res.status(404).json({ message: 'Message not found' });
  }
});

export default router;
