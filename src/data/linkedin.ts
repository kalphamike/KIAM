import { OWNER_NAME } from "./seed";

export const linkedInInfo = {
  name: "Kalinganire Ishimwe Alpha Michelange",
  headline: "Full-Stack Developer | UI/UX Designer | Tech Enthusiast",
  location: "Kigali, Rwanda",
  about: "Passionate Full-Stack Developer with expertise in building beautiful, user-friendly web applications. Skilled in React, TypeScript, Node.js, and modern web technologies. I love turning ideas into reality through clean code and great UX.",

  experience: [
    {
      title: "Full-Stack Developer",
      company: "Tech Solutions Ltd",
      duration: "2023 - Present",
      description: "Building scalable web applications and leading technical projects."
    },
    {
      title: "Junior Developer",
      company: "Digital Agency",
      duration: "2021 - 2023",
      description: "Developed responsive websites and mobile applications for clients."
    }
  ],

  education: [
    {
      degree: "Computer Science",
      school: "University of Rwanda",
      year: "2020"
    }
  ],

  skills: [
    "React", "TypeScript", "Node.js", "JavaScript", "HTML", "CSS",
    "UI/UX Design", "Figma", "PostgreSQL", "MongoDB", "Git", "REST APIs"
  ],

  certifications: [
    "Meta Front-End Developer Certificate",
    "Google UX Design Certificate"
  ],

  connections: "500+",
  
  profileUrl: "https://www.linkedin.com/in/kalinganire-ishimwe-alpha-michelange-b8a30a135/",
  
  email: "ishimwealpha@gmail.com",
  phone: "+250781975565"
};

export const getLinkedInInfo = () => linkedInInfo;