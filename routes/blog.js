const express = require('express');
const mongodb = require('mongodb');
const multer = require('multer')

const db = require('../data/database');
const transliteration = require('transliteration');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

const storageConfig = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'imagesFolder')
  },
  filename:(req,file,cb)=>{
    cb(null, Date.now()+'-'+file.originalname)
  }
})

const upload = multer({storage:storageConfig})

router.get('/', function (req, res) {
  res.redirect('/postsHTML');
});

router.get('/posts', async function (req, res) {
  const posts = await db
    .getDb()
    .collection('posts')
    .find({}, { title: 1, summary: 1, 'author.name': 1 })
    .toArray();
  res.render('posts-list', { posts: posts });
});

router.get('/new-post', async function (req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors });
});

router.post('/posts', upload.array('images', 10), async function (req, res) {
  const imageFile = req.files
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    geo:req.body.geolocation,
    transliterated: transliteration.transliterate(req.body.summary),
    image:imageFile,
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  console.log(result);
  res.redirect('/posts');
});

router.get('/post-detail/:id', async function (req, res) {
  const postId = req.params.id;
  console.log(postId)
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ transliterated: postId}, { summary: 0 });

  if (!post) {
    console.log('not found')
    return res.status(404).render('404');
  }

  console.log(post)
  res.render('post-detail', { post: post, comments: null });
});

router.get('/posts/:id/edit', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render('404');
  }

  res.render('update-post', { post: post });
});

router.post('/posts/:id/edit', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          // date: new Date()
        },
      }
    );

  res.redirect('/posts');
});

router.post('/posts/:id/delete', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .deleteOne({ _id: postId });
  res.redirect('/posts');
});

router.get('/posts/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const post = await db.getDb().collection('posts').findOne({ _id: postId });
  const comments = await db
    .getDb()
    .collection('comments')
    .find({ postId: postId }).toArray();

  return res.render('post-detail', { post: post, comments: comments });
});

router.post('/posts/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newComment = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
  };
  await db.getDb().collection('comments').insertOne(newComment);
  res.redirect('/posts/' + req.params.id);
});

module.exports = router;
