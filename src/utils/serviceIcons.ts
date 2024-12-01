import { 
  Clock, 
  Bed, 
  Car, 
  DoorOpen, 
  Bath, 
  Sparkles, 
  Heart, 
  Baby, 
  Dog, 
  Key, 
  Utensils,
  Coffee,
  Wifi,
  Tv,
  Music,
  Bike,
  Briefcase,
  Camera,
  ChefHat,
  Dumbbell,
  Fan,
  Flower2,
  Gamepad2,
  Gift,
  Globe,
  Laptop,
  Palette,
  ParkingCircle,
  Plane,
  Printer,
  Container,
  ShoppingBag,
  Sofa,
  Sun,
  Waves,
  Umbrella,
  Wine,
  type LucideIcon
} from 'lucide-react';

export const serviceIcons: Record<string, LucideIcon> = {
  clock: Clock,
  bed: Bed,
  car: Car,
  door: DoorOpen,
  bath: Bath,
  sparkles: Sparkles,
  heart: Heart,
  baby: Baby,
  dog: Dog,
  key: Key,
  utensils: Utensils,
  coffee: Coffee,
  wifi: Wifi,
  tv: Tv,
  music: Music,
  bike: Bike,
  briefcase: Briefcase,
  camera: Camera,
  chef: ChefHat,
  dumbbell: Dumbbell,
  fan: Fan,
  flower: Flower2,
  gamepad: Gamepad2,
  gift: Gift,
  globe: Globe,
  laptop: Laptop,
  palette: Palette,
  parking: ParkingCircle,
  plane: Plane,
  printer: Printer,
  refrigerator: Container,
  shopping: ShoppingBag,
  sofa: Sofa,
  sun: Sun,
  swim: Waves,
  umbrella: Umbrella,
  waves: Waves,
  wine: Wine
};

export const serviceTemplates = [
  {
    icon: 'clock',
    name: 'Check-in Anticipé',
    description: 'Profitez de votre logement plus tôt ! Accès dès 15h pour un début de séjour en douceur.',
    price: 15
  },
  {
    icon: 'clock',
    name: 'Check-out Tardif',
    description: 'Prolongez votre séjour jusqu\'à 12h le jour du départ pour un maximum de confort.',
    price: 15
  },
  {
    icon: 'door',
    name: 'Accueil Tardif',
    description: 'Arrivée flexible jusqu\'à 22h avec accueil personnalisé par notre équipe.',
    price: 25
  },
  {
    icon: 'clock',
    name: 'Pack Horaires Flexibles',
    description: 'Arrivée anticipée et départ tardif pour une expérience sans stress.',
    price: 25
  },
  {
    icon: 'key',
    name: 'Accueil Personnalisé',
    description: 'Remise des clés en main propre avec présentation complète du logement.',
    price: 25
  },
  {
    icon: 'bed',
    name: 'Pack Linge Premium',
    description: 'Ensemble complet de linge de maison de qualité pour votre confort.',
    price: 12
  },
  {
    icon: 'bed',
    name: 'Service Lit Préparé',
    description: 'Trouvez votre lit parfaitement fait à votre arrivée.',
    price: 8
  },
  {
    icon: 'car',
    name: 'Stationnement Privé',
    description: 'Place de parking sécurisée à proximité immédiate.',
    price: 10
  },
  {
    icon: 'dog',
    name: 'Option Animal',
    description: 'Accueil adapté pour votre compagnon à quatre pattes.',
    price: 15
  },
  {
    icon: 'baby',
    name: 'Équipement Bébé',
    description: 'Lit parapluie confortable pour le confort de votre bébé.',
    price: 7
  },
  {
    icon: 'sparkles',
    name: 'Ménage Intermédiaire',
    description: 'Service de nettoyage complet pendant votre séjour.',
    price: 25
  },
  {
    icon: 'sparkles',
    name: 'Ménage Final',
    description: 'Service de nettoyage complet en fin de séjour.',
    price: 150
  },
  {
    icon: 'heart',
    name: 'Pack Romantique',
    description: 'Ambiance romantique avec champagne offert pour une soirée magique.',
    price: 45
  }
];