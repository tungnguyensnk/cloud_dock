export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  // check if PASSWORD environment variable exists and is not empty
  const passwordRequired = !!(process.env.PASSWORD && process.env.PASSWORD.trim());

  res.status(200).json({
    required: passwordRequired
  });
}