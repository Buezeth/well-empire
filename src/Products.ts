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
  volume?: string; // Optional volume (e.g. "2L")
}

export const products: Product[] = [
  { 
    id: 0, 
    title: "DIVINE CLEANSER", 
    desc: "🧼 Produit multi-usage (ménage, lessive, vaisselle, véhicule, etc)", 
    color: "#2563eb", 
    bgColor: "#1fb6b7", 
    image: "/Divin Cleanser.png",
    depthImage: "/Divin Cleanser Depthmap.png",
    isLight: false,
    price: 1000,
    isActive: true
  },
  { 
    id: 1, 
    title: "GENTLE BLISS", 
    desc: "🌸 Le linge qui sent bon, même après une longue journée ? Gentle Bliss fait le travail.", 
    color: "#dc2626", 
    bgColor: "#dd8fc8", 
    image: "/Gentle Bliss.png",
    depthImage: "/Gentle Bliss Depthmap.png",
    isLight: false,
    price: 4000,
    volume: "2L",
    isActive: true
  },
  { 
    id: 2, 
    title: "PUSBA", 
    desc: "L’hygiène n’est pas un luxe. Pusba, c’est la sécurité du quotidien, version camerounaise.", 
    color: "#16a34a", 
    bgColor: "#c3d5e5", 
    image: "/Pusba.png",
    depthImage: "/Pusba Depthmap.png",
    isLight: false,
    price: 1000,
    isActive: true
  },
  { 
    id: 3, 
    title: "ENJOY", 
    desc: "🍋 Enjoy, le vinaigre alimentaire qui respecte nos habitudes de cuisine. Simple, Efficace, Local", 
    color: "#16a34a", 
    bgColor: "#aeb48d", 
    image: "/Enjoy.png",
    depthImage: "/Enjoy Depthmap.png",
    isLight: true,
    price: 400,
    isActive: true
  },
];