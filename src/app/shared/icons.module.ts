import { NgModule } from '@angular/core';
import {
  LucideAngularModule,
  // ===== CORE / COMMON =====
  Settings,
  Search,
  Download,
  Plus,
  Save,
  ChevronDown,
  X,
  Home,
  Pencil,
  Trash2,
  Layers,
  // ===== USER / AUTH =====
  User,
  Users,
  UserRound,
  IdCard,
  ShieldCheck,
  LockKeyhole,

  // ===== BUSINESS / COMPANY =====
  Building2,
  Landmark,
  Briefcase,

  // ===== INVENTORY / PRODUCT =====
  Package,
  Box,
  Tag,
  Truck,
  ShoppingCart,
  Shield,

  // ===== LAYOUT =====
  Grid,
  LayoutGrid,
  Hash,

  // ===== FINANCE / TAX =====
  DollarSign,
  Percent,
  Calculator,
  IndianRupee,
  Wallet,
  CreditCard,
  ArrowLeft,

  // ===== FILE / EXPORT =====
  FilePlus,
  FileX,
  FilePlus2,
  FileX2,
  FileSpreadsheet,
  FileCode,
  FileText,
  Receipt,
  BarChart,
  BarChart2,
  AlertCircle,
  AlertTriangle,
  Menu,
  Edit,
  EyeOff,
  // ===== DASHBOARD / CHARTS =====
  Calendar,
  PieChart,
  TrendingUp,
  ArrowRightLeft,
  RefreshCw,
  GitBranch,
  UploadCloud,
  // ===== MEASUREMENT =====
  Ruler,
  Droplet,
  UserCheck,
  Folder,
  PlusCircle,
  Eye,
  List,
} from 'lucide-angular';
import { File } from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      // CORE
      Settings,
      Search,
      Download,
      Plus,
      Save,
      ChevronDown,
      X,
      Shield,
      File,
      // USER / AUTH
      User,
      Users,
      UserRound,
      IdCard,
      ShieldCheck,
      LockKeyhole,
      UserCheck,
      // BUSINESS
      Building2,
      Landmark,
      Briefcase,
      ArrowLeft,
      // INVENTORY
      EyeOff,
      Package,
      Box,
      Tag,
      Truck,
      Edit,
      ShoppingCart,
      GitBranch,
      Eye,
      // LAYOUT
      Grid,
      LayoutGrid,
      Hash,

      // FINANCE / TERMINAL DASHBOARD
      DollarSign,
      Percent,
      Calculator,
      IndianRupee,
      Wallet,
      CreditCard,
      Receipt,

      // FILE / EXPORT
      FilePlus,
      FileX,
      FilePlus2,
      FileX2,
      FileSpreadsheet,
      FileCode,
      FileText,

      // DASHBOARD / CHARTS
      Calendar,
      PieChart,
      TrendingUp,
      ArrowRightLeft,
      RefreshCw,
      AlertTriangle,

      // MEASUREMENT
      Ruler,
      Droplet,
      BarChart,
      BarChart2,
      AlertCircle,
      Menu,
      Pencil,
      Trash2,
      Layers,
      Folder,
      UploadCloud,
      PlusCircle,
      Home,
      List
    }),
  ],
  exports: [LucideAngularModule],
})
export class IconsModule {}
