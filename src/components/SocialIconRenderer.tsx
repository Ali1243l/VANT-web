import React from 'react';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  MessageCircle,
  MessageSquare,
  Send,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Map,
  Star,
  Sparkles,
  Briefcase,
  Flame,
  Crown,
  BookOpen,
  Eye,
  Feather,
  Newspaper,
  Gem,
  Bookmark,
  Video,
  ShoppingBag,
  Tag,
  Layers,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Heart,
  Palette,
  Dribbble,
  Boxes,
  Camera,
  Image,
  Figma,
  Github,
  Award,
  Zap,
  Music,
  Radio,
  Headphones,
  Mic,
  Tv,
  Film,
  Book,
  Globe,
  AtSign,
  Shield,
  Link as LinkIcon,
} from 'lucide-react';

interface Props {
  iconName?: string;
  customSvg?: string;
  className?: string;
}

export default function SocialIconRenderer({ iconName, customSvg, className = 'h-3.5 w-3.5' }: Props) {
  if (customSvg) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        dangerouslySetInnerHTML={{ __html: customSvg }}
      />
    );
  }

  switch (iconName?.toLowerCase()) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'pinterest':
      return (
        <svg className={`${className} fill-current`} viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={`${className} fill-current`} viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return <Twitter className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'atsign':
    case 'threads':
      return <AtSign className={className} />;
    case 'messagecircle':
    case 'discord':
      return <MessageCircle className={className} />;
    case 'messagesquare':
    case 'reddit':
    case 'wechat':
      return <MessageSquare className={className} />;
    case 'send':
    case 'telegram':
      return <Send className={className} />;
    case 'phonecall':
    case 'whatsapp':
      return <PhoneCall className={className} />;
    case 'phone':
      return <Phone className={className} />;
    case 'mail':
      return <Mail className={className} />;
    case 'mappin':
      return <MapPin className={className} />;
    case 'map':
      return <Map className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'bookopen':
      return <BookOpen className={className} />;
    case 'eye':
      return <Eye className={className} />;
    case 'feather':
      return <Feather className={className} />;
    case 'newspaper':
      return <Newspaper className={className} />;
    case 'gem':
      return <Gem className={className} />;
    case 'bookmark':
      return <Bookmark className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'shoppingbag':
      return <ShoppingBag className={className} />;
    case 'tag':
      return <Tag className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'shieldcheck':
      return <ShieldCheck className={className} />;
    case 'checkcircle':
      return <CheckCircle className={className} />;
    case 'trendingup':
      return <TrendingUp className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'palette':
      return <Palette className={className} />;
    case 'dribbble':
      return <Dribbble className={className} />;
    case 'boxes':
      return <Boxes className={className} />;
    case 'camera':
      return <Camera className={className} />;
    case 'image':
      return <Image className={className} />;
    case 'figma':
      return <Figma className={className} />;
    case 'github':
      return <Github className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'radio':
      return <Radio className={className} />;
    case 'headphones':
      return <Headphones className={className} />;
    case 'mic':
      return <Mic className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'book':
      return <Book className={className} />;
    case 'shield':
      return <Shield className={className} />;
    default:
      return <Globe className={className} />;
  }
}
