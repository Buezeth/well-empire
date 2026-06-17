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
  price: number; // Price in XAF (FCFA)
  isActive: boolean; // Controls whether 'ACTIF' or 'INACTIF' is shown
}

export const products: Product[] = [
  { 
    id: 0, 
    title: "DIVINE CLEANSER", 
    desc: "For multi-purpose cleaning - 1L / Pour un nettoyage multi-usage ultra-efficace", 
    color: "#2563eb", 
    bgColor: "#0A1024", 
    image: "/Divin Cleanser.png",
    depthImage: "/Divin Cleanser depthmap.png",
    isLight: false,
    price: 1500,
    isActive: true
  },
  { 
    id: 1, 
    title: "GENTLE BLISS", 
    desc: "Gentle foaming hand soap - 500ml / Savon mousse doux parfumé pour les mains", 
    color: "#dc2626", 
    bgColor: "#5a374f", 
    image: "/Gentle Bliss.png",
    depthImage: "/Gentle Bliss Depth.png",
    isLight: false,
    price: 2000,
    isActive: true
  },
  { 
    id: 2, 
    title: "PUSBA", 
    desc: "Eau de Javel désinfectante - 250ml / Powerful disinfectant bleach solution", 
    color: "#16a34a", 
    bgColor: "#0A2412", 
    image: "/Pusba.png",
    depthImage: "/Pusba depthmap.png",
    isLight: false,
    price: 800,
    isActive: true
  },
  { 
    id: 3, 
    title: "ENJOY", 
    desc: "Le vinaigre alimentaire de table qui respecte nos habitudes de cuisine - 400g", 
    color: "#16a34a", 
    bgColor: "#f7f8ff", 
    image: "/Enjoy.png",
    depthImage: "/Enjoy depthmap.png",
    isLight: true,
    price: 1200,
    isActive: true
  },
];