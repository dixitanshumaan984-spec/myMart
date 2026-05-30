import imagekit from '../config/imagekit.js';

export const getImageKitAuth = (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};