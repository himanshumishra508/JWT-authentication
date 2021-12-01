const dashboard = (req, res) => {
  return res.json({ success: true, message: "Access provided" });
};

module.exports = {
  dashboard,
};
