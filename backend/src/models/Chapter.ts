import mongoose, { type Document, type Types } from "mongoose";

export const NOTE_TYPES = ["plot", "scene", "idea"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export interface IChapter extends Document {
  title: string;
  content: Record<string, unknown>;
  pageNumber: number;
  project: Types.ObjectId;
  notes: { text: string; type: NoteType }[];
}

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "A note needs some text."],
    trim: true,
    maxlength: [2000, "A note can be at most 2000 characters."],
  },
  type: {
    type: String,
    enum: NOTE_TYPES,
    default: "scene",
    set: (val: string) => (val === "" ? "scene" : val),
  },
});

noteSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const chapterSchema = new mongoose.Schema<IChapter>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title."],
      trim: true,
      maxlength: [120, "Title can be at most 120 characters."],
    },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    pageNumber: { type: Number, default: 1 },
    notes: { type: [noteSchema], default: [] },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: [true, "Every chapter must belong to a project."],
    },
  },
  { timestamps: true, minimize: false }, // keep {} content for new chapters
);

chapterSchema.index({ project: 1, pageNumber: 1 });

chapterSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.project;
    return ret;
  },
});

export default mongoose.model<IChapter>("chapter", chapterSchema);
