import Writing from "../models/Writing";

export const home = async (req, res) => {
  const writings = await Writing.find({}).sort({ createdAt: "desc" });
  return res.status(200).json({
    writings,
  });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const writing = await Writing.findById(id);
  if (!writing) {
    return res.status(404).json({
      message: "글을 찾을 수 없습니다.",
    });
  }
  return res.status(200).json({
    writing,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const writing = await Writing.findById(id);
  if (!writing) {
    return res.status(404).json({ error: "글을 찾을 수 없습니다." });
  }
  return res.status(200).json({
    writing,
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, text, categories } = req.body;
  const writing = await Writing.exists({ _id: id });
  if (!writing) {
    return res.status(404).json({
      error: "글을 찾을 수 없습니다.",
    });
  }
  await Writing.findByIdAndUpdate(id, {
    title,
    text,
    categories: Writing.formatCategories(categories),
  });
  return res.status(200).json({
    id,
  });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { title, text, categories } = req.body;
  try {
    const newVideo = await Writing.create({
      title,
      text,
      owner: _id,
      categories: Writing.formatCategories(categories),
    });
    const user = await User.findById(_id);
    user.writings.push(newVideo._id);
    user.save();
    return res.status(200).json({
      message: "업로드 성공!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "업로드 실패",
    });
  }
};

export const deleteWriting = async (req, res) => {
  const { id } = req.params;
  await Writing.findByIdAndDelete(id);
  return res.status(200).json({
    message: "삭제 성공!",
  });
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let writings = [];
  if (keyword) {
    writings = await Writing.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  return res.render({
    writings,
  });
};
