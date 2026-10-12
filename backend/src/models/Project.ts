import mongoose, { type Document, type Types } from "mongoose";

export interface IProject extends Document {
  title: string;
  description?: string;
  owner: Types.ObjectId;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title."],
      trim: true,
      maxlength: [120, "Title can be at most 120 characters."],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description can be at most 500 characters."],
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Every project must belong to a user."],
    },
  },
  { timestamps: true },
);

projectSchema.index({ owner: 1, updatedAt: -1 });

projectSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.owner;
    return ret;
  },
});

export default mongoose.model<IProject>("project", projectSchema);
