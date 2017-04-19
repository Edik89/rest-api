import mongoose from '../moongoseConnect';

const organizationShema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address:String,
  created: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Org', organizationShema);
