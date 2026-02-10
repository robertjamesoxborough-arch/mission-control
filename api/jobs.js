export const config = { runtime: "nodejs" };

export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Jobs API wired correctly",
    timestamp: new Date().toISOString()
  });
}
