export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const {password} = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  // get password from environment variable
  const correctPassword = process.env.PASSWORD;

  if (!correctPassword) {
    return res.status(200).json({
      success: true,
      message: 'No password protection configured'
    });
  }

  // verify password
  if (password === correctPassword) {
    return res.status(200).json({
      success: true,
      message: 'Password verified'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid password'
    });
  }
}