const mongoose = require('mongoose');
const { Schema } = mongoose;

const TicketSchema = new Schema({
   
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    ticket_id:{
        type : String,
        required : true,
        unique : true
    },

    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true,
    },
    priority: {
        type: String,
        required : true,
        enum: ["low", "medium", "high"],
        default: "medium",
    },

    status: {
        type: String,
        required : true,
        enum: ["Due", "In-progress", "Completed"],
        default: "Due",
    },

    created_at : {
        type : Date,
        default : Date.now
    },
    updated_at : {
        type : Date,
        default : Date.now
    },
  });

  const Ticket = mongoose.model('ticket', TicketSchema);
  module.exports = Ticket