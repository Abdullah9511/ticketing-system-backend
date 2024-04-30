const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// ROUTE 1 : Fetch all tickets using : GET "api/tickets/fetchalltickets". Login required

router.get("/fetchalltickets", fetchuser, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id });
    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error");
  }
});

// ROUTE 2 : Add a ticket using : GET "api/tickets/addticket". Login required

router.post(
  "/addticket",
  fetchuser,
  [
    body("ticket_id", "Enter a valid ticket ID").isLength({ min: 5, max: 5 }),
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description should be at least 5 characters").isLength(
      { min: 5 }
    ),
    body("priority", "Enter a valid priority").isIn(["low", "medium", "high"]),
    body("agent_name", "Enter a valid agent name").isString(),
  ],
  async (req, res) => {
    try {
      // Validate the request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ticket_id, title, description, priority, agent_name } = req.body;

      // Check if a ticket with the same ID already exists
      const existingTicket = await Ticket.findOne({ ticket_id });
      if (existingTicket) {
        return res
          .status(400)
          .json({ error: "Ticket with this ID already exists" });
      }

      // Find the agent by name
      const agent = await User.findOne({ name: agent_name, type: "agent" });
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Create the ticket
      const ticket = await Ticket.create({
        ticket_id,
        title,
        description,
        priority,
        user: agent._id,
      });

      res.json(ticket);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server Error");
    }
  }
);

// ROUTE 3 : Update ticket status using : PUT "api/tickets/updateticketstatus". Login required

router.put("/updateticketstatus/:id", fetchuser, async (req, res) => {
  try {
    const { status } = req.body;

    const newTicket = {};

    if (status) {
      newTicket.status = status;
    }

    // Find the ticket to be updated

    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send("Note not found");
    }

    //Check the user

    if (ticket.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorized");
    }

    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: newTicket },
      { new: true }
    );

    res.json(ticket);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error");
  }
});

// ROUTE 4 : Fetch all tickets of an agent by name : GET "api/tickets/fetchagenttickets". Login required

router.get("/fetchagenttickets/:agentName", async (req, res) => {
  try {
    // Find the user with the provided name
    const agent = await User.findOne({ name: req.params.agentName });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Fetch tickets assigned to the agent
    const tickets = await Ticket.find({ user: agent._id });

    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error");
  }
});

// ROUTE 5 : Fetch pending tickets of an agent : GET "api/tickets/pendingtickets". Login required

router.get("/pendingtickets", fetchuser, async (req, res) => {
  try {
    // Find tickets assigned to the agent with statuses "Due" or "In-progress"

    const tickets = await Ticket.find({
      user: req.user.id,
      status: { $in: ["Due", "In-progress"] },
    });

    // Check if no tickets are found
    if (tickets.length === 0) {
      return res.json({ message: "No pending tickets" });
    }

    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error");
  }
});

// ROUTE 6 : Fetch completed tickets of an agent : GET "api/tickets/completedtickets". Login required

router.get("/completedtickets", fetchuser, async (req, res) => {
  try {
    // Find tickets assigned to the agent with statuses "Completed"

    const tickets = await Ticket.find({
      user: req.user.id,
      status: { $in: ["Completed"] },
    });

    // Check if no tickets are found
    if (tickets.length === 0) {
      return res.json({ message: "No Completed tickets" });
    }

    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error");
  }
});

module.exports = router;
