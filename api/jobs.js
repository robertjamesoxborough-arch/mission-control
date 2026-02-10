export default async function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Jobs API wired correctly",
    timestamp: new Date().toISOString()
  });
}


