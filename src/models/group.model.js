const mongoose = require('mongoose');

const { Types } = mongoose.Schema;

const groupSchema = new mongoose.Schema({
  name: {
    type: Types.String,
    required: [true, 'MISSING'],
    trim: true,
  },
  leader: {
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  },
  disabled: {
    type: Types.Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

groupSchema.methods.getPayload = function() {
  return {
    id: this.id,
    name: this.name,
  };
};

module.exports = mongoose.model('Group', groupSchema);
