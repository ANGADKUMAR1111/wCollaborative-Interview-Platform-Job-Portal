// models/resumeModel.js
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  linkedin: String,
  github: String,
  skills: [String],
  experiences: [
    {
      org: String,
      pos: String,
      desc: String,
      dur: String,
    },
  ],
  projects: [
    {
      title: String,
      link: String,
      desc: String,
    },
  ],
  education: [
    {
      school: String,
      year: String,
      qualification: String,
      desc: String,
    },
  ],
  extras: {
    languages: String,
    hobbies: String,
  },
});

export const Resume = mongoose.model("Resume", resumeSchema);
