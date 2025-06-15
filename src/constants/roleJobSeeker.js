require("dotenv").config();

const roles = [
  {
    id: "0",
    label: "Designer",
    icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/0.svg`
  },
  {
    id: "1",
    label: "Front end",
    icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/1.svg`
  },
  {
    id: "2",
    label: "Content",
    icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/2.svg`
  },
  {
    id: "3",
    label: "Marketer",
    icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/3.svg`
  },
  {
    id: "4",
    label: "Business analyst",
    icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/4.svg`
  },

];

module.exports = roles;
