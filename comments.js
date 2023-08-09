// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');

// Create an express application
const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// Route handler for GET request to /posts/:id/comments
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Route handler for POST request to /posts/:id/comments
app.post('/posts/:id/comments', (req, res) => {
  const commentId = randomBytes(4).toString('hex'); // Generate random comment ID
  const { content } = req.body; // Extract content from request body

  // Get comments for specific post ID
  const comments = commentsByPostId[req.params.id] || [];

  // Push new comment to comments array
  comments.push({ id: commentId, content, status: 'pending' });

  // Update comments for specific post ID
  commentsByPostId[req.params.id] = comments;

  // Send response with new comment
  res.status(201).send(comments);
});

// Route handler for POST request to /events
app.post('/events', (req, res) => {
  // Extract event type and data from request body
  const { type, data } = req.body;

  // If event type is 'CommentModerated'
  if (type === 'CommentModerated') {
    // Get comments for specific post ID
    const comments = commentsByPostId[data.postId];

    // Find comment with matching ID
    const comment = comments.find((comment) => {
      return comment.id === data.id;
    });

    // Update comment status
    comment.status = data.status;

    // Send event to event bus
    axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        id: data.id,
        postId: data.postId,
        content: data.content,
        status: data.status,
      },
    });
  }

  // Send response
  res.send({});
});

// Listen on port 4001
app.listen(4001, () => {
  console.log('Listening on 4001');
});