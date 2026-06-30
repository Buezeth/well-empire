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
    desc: "🧼 Produit multi-usage (ménage, lessive, vaisselle, véhicule, etc)", 
    color: "#2563eb", 
    bgColor: "#1fb6b7", 
    image: "/Divin Cleanser 2_op.png",
    depthImage: "/Divin Cleanser 2 depthmap.png",
    isLight: false,
    price: 1500,
    isActive: true
  },
  { 
    id: 1, 
    title: "GENTLE BLISS", 
    desc: "🌸 Le linge qui sent bon, même après une longue journée ? Gentle Bliss fait le travail.", 
    color: "#dc2626", 
    bgColor: "#15c6e1", 
    image: "/Gentle Bliss_op.png",
    depthImage: "/Gentle Bliss Depth.png",
    isLight: false,
    price: 2000,
    isActive: true
  },
  { 
    id: 2, 
    title: "PUSBA", 
    desc: "L’hygiène n’est pas un luxe. Pusba, c’est la sécurité du quotidien, version camerounaise.", 
    color: "#16a34a", 
    bgColor: "#c3d5e5", 
    image: "/Pusba_op.png",
    depthImage: "/Pusba depthmap.png",
    isLight: false,
    price: 800,
    isActive: true
  },
  { 
    id: 3, 
    title: "ENJOY", 
    desc: "🍋 Enjoy, le vinaigre alimentaire qui respecte nos habitudes de cuisine. Simple, Efficace, Local", 
    color: "#16a34a", 
    bgColor: "#aeb48d", 
    image: "/Enjoy 2_op.png",
    depthImage: "/Enjoy 2 depthmap.png",
    isLight: true,
    price: 1200,
    isActive: true
  },
];