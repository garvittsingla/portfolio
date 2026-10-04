export interface ShelfBook {
  id: string;
  title: string;
  author: string;
  tags: string[];
  coverImage: string;
  goodreadsUrl: string;
  amazonUrl: string;
}

export const SHELF_BOOKS: ShelfBook[] = [
  {
    id: "ostep",
    title: "Operating Systems: Three Easy Pieces (OSTEP)",
    author: "Remzi H. Arpaci-Dusseau & Andrea C. Arpaci-Dusseau",
    tags: [
      "Systems & Architecture",
      "Operating Systems",
      "Concurrency",
      "Multi-threading",
      "Synchronization",
    ],
    coverImage: "/books/ostep.jpg",
    goodreadsUrl: "https://www.goodreads.com/book/show/17374825-operating-systems",
    amazonUrl: "https://www.amazon.com/dp/198508659X",
  },
  {
    id: "system-design-vol1",
    title: "System Design Interview – An insider's guide (Volume 1)",
    author: "Alex Xu",
    tags: [
      "Systems & Architecture",
      "System Design",
      "Design Patterns",
      "Scalability & Caching",
      "Rate Limiting",
    ],
    coverImage: "/books/alex-xu-vol1.jpg",
    goodreadsUrl: "https://www.goodreads.com/book/show/54109255-system-design-interview-an-insider-s-guide",
    amazonUrl: "https://www.amazon.com/dp/1736049100",
  },
  {
    id: "system-design-vol2",
    title: "System Design Interview – An Insider's Guide: Volume 2",
    author: "Alex Xu & Sahn Lam",
    tags: [
      "Systems & Architecture",
      "Distributed Systems",
      "Logging & Metrics",
      "Message Queues",
      "Stream Processing",
    ],
    coverImage: "/books/alex-xu-vol2.jpg",
    goodreadsUrl: "https://www.goodreads.com/book/show/60684030-system-design-interview---an-insider-s-guide-volume-2",
    amazonUrl: "https://www.amazon.com/dp/1736049119",
  },
];
