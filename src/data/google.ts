export interface GoogleReview {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  time: string;
}

export const googleReviews: GoogleReview[] = [
  {
    id: "1",
    authorName: "Mireille Karera",
    rating: 5,
    text: "Mike has been working with our team on developing and maintaining our companies' multiple websites for a number of years. I got to personally work with him closely when he assisted me with a personal campaign website. A former colleague of his, who recommended me to have him on the campaign team, said that he trusted him as he trusts himself. That is quite a statement to hear about someone. It became the start to a journey of discovering his web developing skills as we started the project from ground up with content/infrastructure/design etc. I quickly saw what his former colleague said about him. Within less than 24hrs his quality of work showed up. In addition to the technical skills, he went above and beyond by showing great professional attributes by: working long hours, almost around the clock and into the night to meet the short campaign launch deadline! Being proactive and proposing improvements on a regular basis, even when not prompted to do so. Showing generosity and analytical skills by being on top of things as a skilled Project Manager would do. Mike is a balanced 'left-brained and right-brained' Techie who knows how to relate politely and professionally with seniors and clients. I recommend Mike for successful and thoroughly run projects with a conscientious skilled Website Developer and beyond. Thank you Mike for being a great Leader in your space! Keep it up and please train/mentor more to be like you!",
    time: "a year ago"
  },
  {
    id: "2",
    authorName: "Jean Eric Hirwa",
    rating: 5,
    text: "Michelange built 2 websites for me, I was impressed by his creativity and professionalism. The good thing about him is the way he helped me understand my projects even better before he began working on them. It helped me to make informed decisions on what he would build for me, and at some points, I managed to avoid some upfront issues that would have happened if not for his support.",
    time: "a year ago"
  },
  {
    id: "3",
    authorName: "Christian Rebero Twahirwa",
    rating: 5,
    text: "I am highly impressed with the professionalism and efficiency of your services. The quality of work delivered exceeded my expectations, and the prompt response time made the entire experience seamless. Your expertise and attention to detail truly set you apart. It has been a pleasure working with you, and I highly recommend your services to anyone seeking excellence and reliability.",
    time: "a year ago"
  },
  {
    id: "4",
    authorName: "Jossy Uwase",
    rating: 5,
    text: "I couldn't be happier with the website Mr Kalinganire created for me! The design, functionality, and attention to detail are beyond perfect. The professionalism and exceptional time management made the entire process so smooth and enjoyable. I truly appreciate the dedication and effort you put into bringing my vision to life. Highly recommend, definitely a well deserved 5 star experience!",
    time: "a year ago"
  },
  {
    id: "5",
    authorName: "Derrick MUGISHA",
    rating: 5,
    text: "Hey everyone! Just wanted to share how amazing our session with WordPress expert Michelange Kalinganire was today. I had the chance to learn so much about building and deploying WordPress websites, and it was such an eye-opening experience. Michelange shared some really practical tips and deep insights that I know will make a big difference as we continue to work with WordPress. A huge thank you to Michelange for taking the time to guide us through everything! I'm feeling inspired and ready to put these new skills into practice.",
    time: "a year ago"
  }
];

export const getGoogleReviews = () => googleReviews;

export const getAverageRating = () => {
  const total = googleReviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / googleReviews.length).toFixed(1);
};