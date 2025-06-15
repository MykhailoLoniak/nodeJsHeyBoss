require("dotenv").config();

const skills = [
  // Designer
  { id: "0", roleId: "0", label: "Figma", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/0.svg` },
  { id: "1", roleId: "0", label: "Sketch", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/1.svg` },
  { id: "2", roleId: "0", label: "Adobe XD", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/2.svg` },
  { id: "3", roleId: "0", label: "Photoshop", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/3.svg` },
  { id: "4", roleId: "0", label: "Illustrator", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/4.svg` },
  { id: "5", roleId: "0", label: "User Flow", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/5.svg` },

  // Front end
  { id: "6", roleId: "1", label: "HTML", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/6.svg` },
  { id: "7", roleId: "1", label: "CSS", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/7.svg` },
  { id: "8", roleId: "1", label: "JavaScript", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/8.svg` },
  { id: "9", roleId: "1", label: "React", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/9.svg` },
  { id: "10", roleId: "1", label: "TypeScript", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/10.svg` },
  { id: "11", roleId: "1", label: "Redux", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/11.svg` },
  { id: "12", roleId: "1", label: "Next.js", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/12.svg` },

  // Content
  { id: "13", roleId: "2", label: "Copywriting", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/13.svg` },
  { id: "14", roleId: "2", label: "Proofreading", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/14.svg` },
  { id: "15", roleId: "2", label: "Content Strategy", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/15.svg` },
  { id: "16", roleId: "2", label: "Blog Writing", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/16.svg` },
  { id: "17", roleId: "2", label: "Storytelling", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/17.svg` },
  { id: "18", roleId: "2", label: "Content SEO", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/18.svg` },

  // Marketer
  { id: "19", roleId: "3", label: "SEO", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/19.svg` },
  { id: "20", roleId: "3", label: "Email Marketing", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/20.svg` },
  { id: "21", roleId: "3", label: "Social Media", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/21.svg` },
  { id: "22", roleId: "3", label: "Google Ads", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/22.svg` },
  { id: "23", roleId: "3", label: "Analytics", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/23.svg` },
  { id: "24", roleId: "3", label: "Marketing Strategy", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/24.svg` },

  // Business analyst
  { id: "25", roleId: "4", label: "Data Analysis", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/25.svg` },
  { id: "26", roleId: "4", label: "User Research", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/26.svg` },
  { id: "27", roleId: "4", label: "Business Modeling", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/27.svg` },
  { id: "28", roleId: "4", label: "Requirement Gathering", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/28.svg` },
  { id: "29", roleId: "4", label: "SQL", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/29.svg` },
  { id: "30", roleId: "4", label: "Agile", icon: `${process.env.BACKEND_ORIGIN}/uploads/roleJobSeeker/skills/30.svg` },
];

module.exports = skills;
