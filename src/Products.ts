// src/Products.ts

export interface Product {
  id: number;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
  image: string;
  depthImage: string;
  isLight?: boolean;
}

export const products: Product[] = [
  { 
    id: 0, 
    title: "DIVINE CLEANSER", 
    desc: "For multi-purpose cleaning - 1L", 
    color: "#2563eb", 
    bgColor: "#0A1024", 
    image: "/Divin Cleanser.png",
    depthImage: "/Divin Cleanser depthmap.png",
    isLight: false
  },
  { 
    id: 1, 
    title: "GENTLE BLISS", 
    desc: "Gentle foaming hand soap - 500ml", 
    color: "#dc2626", 
    bgColor: "#5a374f", 
    image: "/Gentle Bliss.png",
    depthImage: "/Gentle Bliss Depth.png",
    isLight: false
  },
  { 
    id: 2, 
    title: "PUSBA", 
    desc: "Eau de Javel - 250ml", 
    color: "#16a34a", 
    bgColor: "#0A2412", 
    image: "/Pusba.png",
    depthImage: "/Pusba depthmap.png",
    isLight: false
  },
  { 
    id: 3, 
    title: "ENJOY", 
    desc: "Enjoy, le vinaigre alimentaire qui respecte nos habitudes de cuisine - 400g", 
    color: "#16a34a", 
    bgColor: "#f7f8ff", 
    image: "/Enjoy.png",
    depthImage: "/Enjoy depthmap.png",
    isLight: true
  },
];