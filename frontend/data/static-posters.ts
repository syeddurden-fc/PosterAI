/**
 * Static poster data for HOME PAGE ONLY
 * Uses the 4 images provided in chat for the layout showcase
 */

export interface StaticPoster {
  id: number
  title: string
  description: string
  image_url: string
  price: number
  category: string
  width: number
  height: number
  orientation: "portrait" | "landscape" | "square"
  style: string
  theme: string
  rating: number
  is_featured: boolean
}

/**
 * Home page showcase posters - using local images from public folder
 * These are the 4 custom poster images provided
 */
export const HOME_PAGE_POSTERS: StaticPoster[] = [
  {
    id: 1,
    title: "Cinematic Drive",
    description: "High-speed cinematic poster with red background",
    image_url: "/posters/9f28c485c6c79fdb63131c92e4dff05e.jpg",
    price: 299.99,
    category: "Movies",
    width: 400,
    height: 600,
    orientation: "portrait",
    style: "cinematic",
    theme: "dark",
    rating: 4.8,
    is_featured: true,
  },
  {
    id: 2,
    title: "Leo Action",
    description: "Intense action movie poster - Leo",
    image_url: "/posters/a90876168dcbbe5442c4cb30d709a820.jpg",
    price: 279.99,
    category: "Movies",
    width: 400,
    height: 600,
    orientation: "portrait",
    style: "cinematic",
    theme: "dark",
    rating: 4.7,
    is_featured: true,
  },
  {
    id: 3,
    title: "Red Cinema",
    description: "Bold red cinematic poster",
    image_url: "/posters/download (1).png",
    price: 269.99,
    category: "Movies",
    width: 400,
    height: 600,
    orientation: "portrait",
    style: "cinematic",
    theme: "dark",
    rating: 4.6,
    is_featured: true,
  },
  {
    id: 4,
    title: "Golden Art",
    description: "Artistic golden poster with hand",
    image_url: "/posters/download.png",
    price: 249.99,
    category: "Art",
    width: 400,
    height: 600,
    orientation: "portrait",
    style: "artistic",
    theme: "warm",
    rating: 4.5,
    is_featured: true,
  },
]
