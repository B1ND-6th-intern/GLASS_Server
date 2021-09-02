import Writing from "../models/Writing";

export const home = async (req, res) => {
  const writings = await Writing.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", writings });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const writing = await Writing.findById(id);
  if (!writing) {
    return res.render("404", { pageTitle: "글을 찾을 수 없습니다." });
  }
  return res.render("writings/watch", { pageTitle: writing.title, writing });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const writing = await Writing.findById(id);
  if (!writing) {
    return res
      .status(404)
      .render("404", { pageTitle: "글을 찾을 수 없습니다." });
  }
  return res.render("writings/edit", {
    pageTitle: `Edit ${writing.title}`,
    writing,
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, text, categories } = req.body;
  const writing = await Writing.exists({ _id: id });
  if (!writing) {
    return res
      .status(404)
      .render("404", { pageTitle: "글을 찾을 수 없습니다." });
  }
  await Writing.findByIdAndUpdate(id, {
    title,
    text,
    categories: Writing.formatCategories(categories),
  });
  return res.redirect(`/writing/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("writings/upload", { pageTitle: "Upload Writing" });
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
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("writings/upload", {
      pageTitle: "Upload Writing",
      errorMessage: error._message,
    });
  }
};

export const deleteWriting = async (req, res) => {
  const { id } = req.params;
  await Writing.findByIdAndDelete(id);
  return res.redirect("/");
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
  return res.render("writings/search", { pageTitle: "Search", writings });
};
