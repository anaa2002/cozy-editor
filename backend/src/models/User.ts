import mongoose, { type Document } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  passwordChangedAt?: Date;

  correctPassword(candidatePassword: string): Promise<boolean>;
  passwordChangedAfter(iat: number): boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username."],
      trim: true,
      maxlength: [40, "Username can be at most 40 characters."],
    },
    email: {
      type: String,
      required: [true, "Please provide an email."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email."],
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: [8, "Password must contain at least 8 characters."],
      // bcrypt only uses the first 72 bytes.
      maxlength: [72, "Password can be at most 72 characters."],
      select: false,
    },
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password!, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.passwordChangedAfter = function (iat: number): boolean {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return changedTimestamp > iat;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
