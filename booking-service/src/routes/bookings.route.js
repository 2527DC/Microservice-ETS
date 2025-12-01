import express from "express";

const router = express.Router();

router.get("/bookings", async (req, res) => {
  const bookings = [
    {
      id: 1,
      userId: 101,
      user: { id: 101, name: "Alice Johnson", email: "alice@example.com" },
      details: "Pickup from Whitefield to Electronic City at 8 AM",
      status: "Scheduled",
      date: "2025-10-29",
    },
    {
      id: 2,
      userId: 102,
      user: { id: 102, name: "Bob Smith", email: "bob@example.com" },
      details: "Drop from Manyata Tech Park to Indiranagar at 6 PM",
      status: "Completed",
      date: "2025-10-27",
    },
  ];

  res.json(bookings);
});

// POST create booking (static response)
router.post("/bookings", async (req, res) => {
  const { userId, details } = req.body;

  const newBooking = {
    id: Math.floor(Math.random() * 1000), // simulate ID
    userId: Number(userId),
    user: { id: userId, name: "Mock User", email: "mock@example.com" },
    details,
    status: "Scheduled",
    date: new Date().toISOString().split("T")[0],
  };

  res.json({
    message: "Booking created successfully (mock)",
    booking: newBooking,
  });
});

// Start the server
router.listen(3000, () => console.log("Server running on port 3000"));
