const { default: mongoose } = require("mongoose");
const moongose = require("mongoose");

const articlesSchema = new mongoose.Schema({
  author: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  title: { type: String, required: true },
  time: { type: Number, default: Date.now },
  comments: Array,
  imgUrl: { type: String, required: true },
  content: String,
  country: { type: String, required: true },
  likes: Array,
});

const postsModel = mongoose.model("posts", articlesSchema);

module.exports = postsModel;
