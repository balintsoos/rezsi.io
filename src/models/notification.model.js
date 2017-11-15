const mongoose = require('mongoose');

const { Types } = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
  user: {
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  },
  bill: {
    type: Types.ObjectId,
    required: true,
    ref: 'Bill',
  },
  type: {
    type: Types.String,
    required: true,
    enum: ['NEW_BILL'],
  },
}, {
  timestamps: true,
});

notificationSchema.methods.getPayload = function() {
  return {
    id: this.id,
    type: this.type,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Notification', notificationSchema);